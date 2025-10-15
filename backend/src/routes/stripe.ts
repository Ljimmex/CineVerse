import { Router, Request, Response, NextFunction } from 'express';
import { stripe, SUBSCRIPTION_PRICES, getPriceTier } from '../config/stripe.js';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Create checkout session
router.post('/create-checkout-session', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { priceId } = req.body;

    if (!Object.values(SUBSCRIPTION_PRICES).includes(priceId)) {
      throw new AppError('Invalid price ID', 400);
    }

    // Get or create Stripe customer
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', req.user!.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user!.email,
        metadata: {
          supabase_user_id: req.user!.id,
        },
      });

      customerId = customer.id;

      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', req.user!.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      metadata: {
        user_id: req.user!.id,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    next(error);
  }
});

// Create customer portal session
router.post('/create-portal-session', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', req.user!.id)
      .single();

    if (!profile?.stripe_customer_id) {
      throw new AppError('No subscription found', 404);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL}/subscription`,
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

// Stripe webhooks
router.post('/webhook', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      throw new AppError(`Webhook Error: ${err.message}`, 400);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.metadata.user_id;
        const subscriptionId = session.subscription;

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        const tier = getPriceTier(priceId);

        // Update user profile
        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_status: 'active',
          })
          .eq('id', userId);

        // Create subscription record
        await supabaseAdmin
          .from('subscriptions')
          .insert({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const priceId = subscription.items.data[0].price.id;
        const tier = getPriceTier(priceId);

        // Update subscription in database
        await supabaseAdmin
          .from('subscriptions')
          .update({
            stripe_price_id: priceId,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('stripe_subscription_id', subscription.id);

        // Update profile
        const { data: subData } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (subData) {
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_tier: tier,
              subscription_status: subscription.status,
            })
            .eq('id', subData.user_id);
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;

        // Update subscription status
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'cancelled',
          })
          .eq('stripe_subscription_id', subscription.id);

        // Update profile
        const { data: subData } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (subData) {
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_tier: 'free',
              subscription_status: 'cancelled',
            })
            .eq('id', subData.user_id);
        }

        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

export default router;


import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error('Missing Stripe secret key');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-10-28.acacia',
  typescript: true,
});

// Subscription price IDs
export const SUBSCRIPTION_PRICES = {
  basic: process.env.STRIPE_PRICE_ID_BASIC || '',
  standard: process.env.STRIPE_PRICE_ID_STANDARD || '',
  premium: process.env.STRIPE_PRICE_ID_PREMIUM || '',
};

// Map price IDs to subscription tiers
export const getPriceTier = (priceId: string): string => {
  switch (priceId) {
    case SUBSCRIPTION_PRICES.basic:
      return 'basic';
    case SUBSCRIPTION_PRICES.standard:
      return 'standard';
    case SUBSCRIPTION_PRICES.premium:
      return 'premium';
    default:
      return 'free';
  }
};

export default stripe;


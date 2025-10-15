# Deployment Guide - VOD Platform

## Prerequisites

- Node.js 18+
- Supabase account
- Stripe account
- Vercel account (for frontend)
- Railway/Render/Fly.io account (for backend)

---

## 1. Supabase Setup

### Create Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down:
   - Project URL
   - Anon/Public key
   - Service Role key (secret)
   - JWT Secret

### Database Setup

1. Open SQL Editor in Supabase Dashboard
2. Run `database/schema.sql`
3. Optionally run `database/seed.sql` for sample data

### Storage Setup

1. Go to Storage in Supabase Dashboard
2. Create buckets:
   - `videos` (public)
   - `thumbnails` (public)
   - `posters` (public)
   - `avatars` (public)

3. Set storage policies for each bucket (see schema.sql comments)

### Authentication Setup

1. Go to Authentication > Providers
2. Enable Email provider
3. Optionally enable OAuth providers (Google, Facebook)
4. Configure redirect URLs for your frontend domain

---

## 2. Stripe Setup

### Create Products

1. Go to [stripe.com/dashboard](https://dashboard.stripe.com)
2. Create products for each plan:
   - Basic - $9.99/month
   - Standard - $14.99/month
   - Premium - $19.99/month

3. Note down Price IDs for each plan

### Webhook Setup

1. Go to Developers > Webhooks
2. Add endpoint: `https://your-backend-api.com/api/v1/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Note down Webhook Secret

---

## 3. Backend Deployment (Railway)

### Prepare Backend

1. Update `backend/.env`:
```env
# Server
PORT=4000
NODE_ENV=production

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
STRIPE_PRICE_ID_BASIC=price_xxxxx
STRIPE_PRICE_ID_STANDARD=price_xxxxx
STRIPE_PRICE_ID_PREMIUM=price_xxxxx

# Frontend
FRONTEND_URL=https://your-frontend-domain.com

# API
API_VERSION=v1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Deploy to Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize project:
```bash
cd backend
railway init
```

4. Deploy:
```bash
railway up
```

5. Set environment variables in Railway dashboard
6. Note down the deployed URL

### Alternative: Render

1. Connect GitHub repository
2. Create new Web Service
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

---

## 4. Frontend Deployment (Vercel)

### Prepare Frontend

1. Update `frontend/.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM=price_xxxxx

# Backend API
NEXT_PUBLIC_API_URL=https://your-backend-api.com

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy:
```bash
cd frontend
vercel --prod
```

4. Or connect GitHub repository in Vercel dashboard
5. Set environment variables
6. Deploy

---

## 5. Post-Deployment

### Update Stripe Webhook

1. Update webhook endpoint URL to production backend URL
2. Test webhook by creating a test subscription

### Update Supabase Auth Redirect URLs

1. Go to Authentication > URL Configuration
2. Add production frontend URL to:
   - Site URL
   - Redirect URLs

### Create Admin User

1. Sign up a user via the app
2. Go to Supabase Dashboard > Table Editor > profiles
3. Find the user and change `role` to `admin`

### Test the Application

1. Sign up a new user
2. Browse videos
3. Subscribe to a plan
4. Test video playback
5. Test admin panel

---

## 6. Monitoring & Maintenance

### Add Monitoring

1. **Sentry** for error tracking:
```bash
npm install @sentry/nextjs  # Frontend
npm install @sentry/node     # Backend
```

2. **Vercel Analytics** for frontend metrics

3. **Railway/Render metrics** for backend performance

### Database Backups

1. Enable Supabase automatic backups
2. Set retention period

### Regular Updates

```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit
npm audit fix
```

---

## 7. Scaling Considerations

### Database

- Enable Supabase read replicas for heavy traffic
- Add database indexes for frequently queried fields
- Consider connection pooling (PgBouncer)

### Storage

- Use CDN for video delivery (Cloudflare, AWS CloudFront)
- Implement video transcoding for multiple qualities
- Consider HLS adaptive bitrate streaming

### API

- Implement Redis caching for frequently accessed data
- Use API rate limiting per user (not just IP)
- Consider API Gateway for advanced routing

### Frontend

- Enable Next.js ISR (Incremental Static Regeneration)
- Implement lazy loading for images and components
- Use Next.js Image optimization

---

## 8. Security Checklist

- [ ] All environment variables are set correctly
- [ ] HTTPS is enabled on all domains
- [ ] Supabase RLS policies are active
- [ ] Stripe webhook signature verification is enabled
- [ ] Rate limiting is configured
- [ ] CORS is properly configured
- [ ] Input validation is implemented
- [ ] SQL injection protection (using Supabase client)
- [ ] XSS protection (React auto-escapes)
- [ ] Admin routes are protected
- [ ] File upload validation is in place

---

## Troubleshooting

### Backend not connecting to Supabase
- Verify environment variables
- Check Supabase service key (not anon key)
- Ensure IP is whitelisted (if applicable)

### Stripe webhook failing
- Verify webhook secret
- Check endpoint URL
- Test with Stripe CLI: `stripe listen --forward-to localhost:4000/api/v1/stripe/webhook`

### Frontend build failing
- Check Node.js version (18+)
- Verify all environment variables
- Clear `.next` folder and rebuild

### Videos not playing
- Check video URL accessibility
- Verify CORS settings on storage bucket
- Ensure video format is supported (MP4 recommended)


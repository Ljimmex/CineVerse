# Development Guide - VOD Platform

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account (free tier is fine for development)
- Stripe account (test mode)

---

## Initial Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd VOD

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Set Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the database schema:
   - Open SQL Editor
   - Paste contents of `database/schema.sql`
   - Execute
3. Optionally run `database/seed.sql` for sample data
4. Create storage buckets (videos, thumbnails, posters, avatars)
5. Get your API keys from Project Settings > API

### 3. Set Up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Switch to Test Mode
3. Create test products and prices
4. Get API keys from Developers > API keys
5. Install Stripe CLI for webhook testing:
```bash
stripe login
stripe listen --forward-to localhost:4000/api/v1/stripe/webhook
```

### 4. Environment Variables

#### Backend `.env`
```env
PORT=4000
NODE_ENV=development

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_ID_BASIC=price_xxxxx
STRIPE_PRICE_ID_STANDARD=price_xxxxx
STRIPE_PRICE_ID_PREMIUM=price_xxxxx

FRONTEND_URL=http://localhost:3000
API_VERSION=v1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM=price_xxxxx

NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Running the Application

### Start Backend

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:4000`

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

---

## Development Workflow

### Project Structure

```
VOD/
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── config/          # Supabase, Stripe configs
│   │   └── index.ts         # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities, API client
│   ├── store/               # Zustand state management
│   ├── package.json
│   └── tsconfig.json
│
├── shared/
│   └── types/               # Shared TypeScript types
│
└── database/
    ├── schema.sql           # Database schema
    └── seed.sql             # Sample data
```

### Adding a New Feature

1. **Database Changes**
   - Update `database/schema.sql` if needed
   - Run the SQL in Supabase dashboard

2. **Backend API**
   - Create or update route in `backend/src/routes/`
   - Add validation schema using Zod
   - Update types in `shared/types/`
   - Test endpoint using Postman or curl

3. **Frontend**
   - Create/update page in `frontend/app/`
   - Create components in `frontend/components/`
   - Use Zustand for state if needed
   - Style with Tailwind CSS

---

## Code Style & Standards

### TypeScript

- Use strict mode
- Define interfaces for all data structures
- Avoid `any` type
- Use proper error handling

### Backend

- Use async/await (no callbacks)
- Validate all inputs with Zod
- Use middleware for auth and validation
- Return consistent error responses
- Add JSDoc comments for complex functions

### Frontend

- Use TypeScript for all components
- Follow React best practices
- Use hooks properly (useEffect, useMemo, etc.)
- Keep components small and focused
- Use Tailwind CSS for styling (no custom CSS unless necessary)

### Naming Conventions

- **Files**: kebab-case (`video-card.tsx`)
- **Components**: PascalCase (`VideoCard`)
- **Functions**: camelCase (`loadVideos`)
- **Constants**: UPPER_SNAKE_CASE (`API_VERSION`)
- **Types/Interfaces**: PascalCase (`Video`, `ApiResponse`)

---

## Testing

### Backend Testing

```bash
cd backend
npm test
```

Create tests in `backend/src/__tests__/`

### Frontend Testing

```bash
cd frontend
npm test              # Unit tests
npm run test:e2e      # E2E tests (Playwright)
```

---

## Common Tasks

### Create Admin User

```sql
-- Run in Supabase SQL Editor after registering a user
UPDATE profiles
SET role = 'admin'
WHERE id = 'user-uuid-here';
```

### Upload a Video

1. Go to admin panel: `http://localhost:3000/admin`
2. Click "Videos" > "Add Video"
3. Upload video file and fill metadata
4. Publish

### Test Stripe Payment

1. Go to subscription page: `http://localhost:3000/subscription`
2. Click on a plan
3. Use test card: `4242 4242 4242 4242`
4. Any future expiry date
5. Any CVC

### Debug Stripe Webhooks

```bash
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start Stripe CLI
stripe listen --forward-to localhost:4000/api/v1/stripe/webhook

# Terminal 3: Trigger test event
stripe trigger checkout.session.completed
```

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 4000 (backend)
npx kill-port 4000

# Kill process on port 3000 (frontend)
npx kill-port 3000
```

### Database Connection Issues

- Verify Supabase URL and keys
- Check if RLS is properly configured
- Ensure service role key is used in backend

### Supabase RLS Blocking Queries

- Temporarily disable RLS for testing (not in production!)
- Check policy definitions in schema.sql
- Use service role key for admin operations

### Video Upload Failing

- Check storage bucket exists
- Verify bucket is public
- Ensure file size is under limit (500MB default)
- Check CORS settings on bucket

---

## Useful Commands

```bash
# Backend
npm run dev         # Start development server
npm run build       # Build for production
npm run lint        # Run ESLint
npm run format      # Format with Prettier

# Frontend
npm run dev         # Start development server
npm run build       # Build for production
npm run lint        # Run ESLint
npm run format      # Format with Prettier

# Database
# (Run in Supabase SQL Editor)
SELECT * FROM profiles;
SELECT * FROM videos WHERE published = true;
SELECT * FROM subscriptions;
```

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Zustand](https://github.com/pmndrs/zustand)

---

## Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Create pull request
5. Wait for review

## Getting Help

- Check existing documentation
- Search GitHub issues
- Ask in team chat
- Create new issue with details


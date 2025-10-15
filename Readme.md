# 🎬 VOD Platform - Video on Demand Streaming Service

Nowoczesna platforma streamingu wideo z systemem subskrypcji, panelem administracyjnym i zaawansowanymi funkcjonalnościami społecznościowymi.

## 📋 Spis Treści

- [Przegląd](#przegląd)
- [Funkcjonalności](#funkcjonalności)
- [Stack Technologiczny](#stack-technologiczny)
- [Struktura Projektu](#struktura-projektu)
- [Instalacja](#instalacja)
- [Konfiguracja](#konfiguracja)
- [Uruchomienie](#uruchomienie)
- [Dokumentacja](#dokumentacja)

## 🎯 Przegląd

VOD Platform to pełnoprawna aplikacja do streamingu wideo, oferująca:

- **Frontend użytkownika** - Intuicyjny interfejs do przeglądania i odtwarzania wideo
- **Panel administracyjny** - Kompleksowe zarządzanie treścią i użytkownikami
- **Backend API** - Bezpieczne API z integracją Supabase i Stripe
- **System subskrypcji** - Płatności przez Stripe z różnymi planami

## ✨ Funkcjonalności

### Dla Użytkowników

- 🔐 **Autentykacja** - Rejestracja/logowanie przez Supabase Auth (email/hasło + OAuth)
- 🎥 **Katalog filmów** - Przeglądanie, wyszukiwanie i filtrowanie treści
- ▶️ **Odtwarzacz wideo** - Zaawansowany player z HLS streaming
- ⭐ **Oceny i komentarze** - System społecznościowy z możliwością interakcji
- ❤️ **Ulubione i historia** - Personalizacja doświadczenia użytkownika
- 💳 **Subskrypcje** - Elastyczne plany płatności przez Stripe
- 👤 **Profile** - Zarządzanie kontem i preferencjami

### Dla Administratorów

- 📊 **Dashboard** - Statystyki i analityka w czasie rzeczywistym
- 🎬 **Zarządzanie filmami** - CRUD operacje na treści wideo
- 👥 **Zarządzanie użytkownikami** - Kontrola nad kontami i rolami
- 💬 **Moderacja** - Nadzór nad komentarzami i treściami
- 📈 **Raporty** - Szczegółowe raporty przychodów i oglądania
- 🏷️ **Kategorie** - Organizacja treści

## 🛠 Stack Technologiczny

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context / Zustand
- **Forms**: React Hook Form + Zod validation
- **Video Player**: Video.js / Plyr

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Payments**: Stripe
- **API Client**: Supabase JS Client

### DevOps & Tools
- **Version Control**: Git & GitHub
- **Package Manager**: pnpm / npm
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel (Frontend), Railway/Render (Backend)
- **Monitoring**: Sentry, Vercel Analytics

## 📁 Struktura Projektu

```
VOD/
├── frontend/                 # Next.js aplikacja
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── (auth)/      # Auth routes (login, register)
│   │   │   ├── (main)/      # Main user routes
│   │   │   ├── admin/       # Admin panel routes
│   │   │   └── api/         # API routes (server actions)
│   │   ├── components/      # React components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── video/       # Video player & cards
│   │   │   ├── admin/       # Admin components
│   │   │   └── layout/      # Layout components
│   │   ├── lib/             # Utilities & helpers
│   │   │   ├── supabase/    # Supabase client
│   │   │   ├── stripe/      # Stripe integration
│   │   │   └── utils/       # Helper functions
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # React Context providers
│   │   ├── types/           # TypeScript types
│   │   └── styles/          # Global styles
│   ├── public/              # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.js
│
├── backend/                 # Express API
│   ├── src/
│   │   ├── routes/          # API routes
│   │   │   ├── auth.ts
│   │   │   ├── videos.ts
│   │   │   ├── users.ts
│   │   │   └── stripe.ts
│   │   ├── middleware/      # Express middleware
│   │   │   ├── auth.ts
│   │   │   ├── validation.ts
│   │   │   └── errorHandler.ts
│   │   ├── services/        # Business logic
│   │   │   ├── videoService.ts
│   │   │   ├── stripeService.ts
│   │   │   └── supabaseService.ts
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utilities
│   │   └── index.ts         # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                  # Shared types & constants
│   ├── types/
│   │   ├── user.ts
│   │   ├── video.ts
│   │   └── subscription.ts
│   └── constants/
│
├── database/                # Database schemas & migrations
│   ├── schema.sql          # Supabase SQL schema
│   ├── migrations/         # Migration files
│   └── seeds/              # Seed data
│
├── docs/                    # Dokumentacja
│   ├── api.md              # API documentation
│   ├── deployment.md       # Deployment guide
│   └── development.md      # Development guide
│
├── .github/
│   └── workflows/          # GitHub Actions
│
├── design.md               # Design system
├── requirements.md         # Wymagania projektu
└── README.md              # Ten plik
```

## 🚀 Instalacja

### Wymagania

- Node.js 18+ 
- pnpm / npm / yarn
- Konto Supabase
- Konto Stripe (test mode)
- Git

### Kroki instalacji

1. **Klonowanie repozytorium**
```bash
git clone <repository-url>
cd VOD
```

2. **Instalacja zależności Frontend**
```bash
cd frontend
pnpm install
```

3. **Instalacja zależności Backend**
```bash
cd ../backend
pnpm install
```

## ⚙️ Konfiguracja

### 1. Supabase Setup

1. Utwórz nowy projekt na [supabase.com](https://supabase.com)
2. Uruchom SQL schema z pliku `database/schema.sql` w SQL Editor
3. Skonfiguruj Authentication providers (Email + opcjonalnie OAuth)
4. Włącz Supabase Storage i utwórz bucket `videos`
5. Skonfiguruj Row Level Security (RLS) policies

### 2. Stripe Setup

1. Utwórz konto na [stripe.com](https://stripe.com)
2. Uzyskaj API keys (test mode)
3. Utwórz produkty i ceny dla planów subskrypcji
4. Skonfiguruj webhook endpoint

### 3. Zmienne środowiskowe

#### Frontend `.env.local`
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:4000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Backend `.env`
```env
# Server
PORT=4000
NODE_ENV=development

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# App
FRONTEND_URL=http://localhost:3000
```

## 🏃 Uruchomienie

### Development Mode

**Terminal 1 - Frontend:**
```bash
cd frontend
pnpm dev
```
Aplikacja dostępna na: `http://localhost:3000`

**Terminal 2 - Backend:**
```bash
cd backend
pnpm dev
```
API dostępne na: `http://localhost:4000`

### Production Build

**Frontend:**
```bash
cd frontend
pnpm build
pnpm start
```

**Backend:**
```bash
cd backend
pnpm build
pnpm start
```

## 📚 Dokumentacja

### Pliki dokumentacji

- **[requirements.md](./requirements.md)** - Pełna specyfikacja wymagań funkcjonalnych i niefunkcjonalnych
- **[design.md](./design.md)** - System designu, komponenty UI, kolory, typografia
- **[docs/api.md](./docs/api.md)** - Dokumentacja API endpoints
- **[docs/development.md](./docs/development.md)** - Guide dla developerów
- **[docs/deployment.md](./docs/deployment.md)** - Instrukcje wdrożenia

### Przydatne linki

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## 🗂 Baza Danych

### Główne tabele

- `users` - Użytkownicy (Supabase Auth)
- `profiles` - Profile użytkowników i subskrypcje
- `videos` - Katalog filmów
- `categories` - Kategorie/gatunki
- `video_categories` - Relacja many-to-many
- `ratings` - Oceny filmów
- `comments` - Komentarze
- `favorites` - Ulubione filmy
- `watch_history` - Historia oglądania
- `subscriptions` - Dane subskrypcji Stripe

Szczegółowy schemat znajduje się w pliku `database/schema.sql`

## 🔒 Bezpieczeństwo

- ✅ Supabase Row Level Security (RLS)
- ✅ JWT Authentication
- ✅ HTTPS only w produkcji
- ✅ Rate limiting
- ✅ Input validation (Zod)
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Bezpieczne zmienne środowiskowe

## 📦 Deployment

### Frontend (Vercel)
1. Połącz repo z Vercel
2. Ustaw zmienne środowiskowe
3. Deploy automatycznie z GitHub

### Backend (Railway / Render)
1. Połącz repo z Railway/Render
2. Ustaw zmienne środowiskowe
3. Deploy z GitHub branch

### Supabase
- Projekt działa w chmurze Supabase
- Automatyczne backupy
- Scalable PostgreSQL

Szczegóły w `docs/deployment.md`

## 🧪 Testing

```bash
# Frontend
cd frontend
pnpm test          # Unit tests
pnpm test:e2e      # E2E tests (Playwright)

# Backend
cd backend
pnpm test          # Unit & integration tests
```

## 🤝 Contributing

1. Fork projektu
2. Utwórz branch (`git checkout -b feature/AmazingFeature`)
3. Commit zmian (`git commit -m 'Add some AmazingFeature'`)
4. Push do brancha (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

## 📝 License

MIT License - szczegóły w pliku `LICENSE`

## 👥 Autorzy

- Development Team

## 🙏 Podziękowania

- Supabase za backend-as-a-service
- Stripe za payment infrastructure
- Vercel za hosting i Next.js

---

**Status projektu**: 🚧 W trakcie rozwoju

**Wersja**: 1.0.0-alpha


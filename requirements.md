# Wymagania Platformy VOD (Video on Demand)

## Przegląd Projektu
Platforma VOD to kompleksowe rozwiązanie do streamingu wideo oferujące użytkownikom dostęp do biblioteki filmów i seriali z systemem subskrypcji.

## Wymagania Funkcjonalne

### 1. System Użytkowników i Autentykacja

#### 1.1 Rejestracja i Logowanie
- Rejestracja za pomocą email/hasło (Supabase Auth)
- Logowanie za pomocą email/hasło
- Opcjonalnie: OAuth (Google, Facebook) - Supabase Auth
- Reset hasła przez email
- Weryfikacja email przy rejestracji

#### 1.2 Profile Użytkownika
- Edycja danych profilu (imię, nazwisko, awatar)
- Zmiana hasła
- Wyświetlanie historii oglądania
- Zarządzanie subskrypcją
- Lista ulubionych filmów/seriali

### 2. Katalog Wideo

#### 2.1 Przeglądanie Treści
- Strona główna z wyróżnionymi filmami
- Grid z posterami filmów/seriali
- Kategoryzacja treści (gatunek, rok produkcji, język)
- Paginacja lub infinite scroll
- Sorting (najnowsze, najpopularniejsze, najlepiej oceniane)

#### 2.2 Wyszukiwanie i Filtrowanie
- Wyszukiwarka pełnotekstowa (tytuł, opis, aktorzy)
- Filtry:
  - Gatunek
  - Rok produkcji
  - Ocena
  - Czas trwania
  - Język

#### 2.3 Szczegóły Filmu
- Poster i trailer
- Tytuł, opis, rok produkcji
- Gatunek, czas trwania
- Ocena średnia i liczba ocen
- Sekcja komentarzy
- Przyciski: odtwórz, dodaj do ulubionych, oceń

### 3. Odtwarzacz Wideo

#### 3.1 Podstawowe Funkcje
- Odtwarzanie wideo (HLS streaming)
- Play/Pauza
- Regulacja głośności
- Fullscreen
- Picture-in-Picture
- Progress bar z możliwością przewijania

#### 3.2 Zaawansowane Funkcje
- Automatyczna zmiana jakości (adaptive bitrate)
- Pamiętanie pozycji odtwarzania
- Napisy (jeśli dostępne)
- Wybór jakości wideo
- Skróty klawiszowe (spacja, strzałki)

### 4. Funkcjonalności Społecznościowe

#### 4.1 System Komentarzy
- Dodawanie komentarzy do filmów
- Odpowiedzi na komentarze (threading)
- Edycja i usuwanie własnych komentarzy
- Sortowanie (najnowsze, najpopularniejsze)
- Moderacja przez adminów

#### 4.2 System Ocen
- Ocena filmu (1-5 gwiazdek lub 1-10)
- Wyświetlanie średniej oceny
- Historia ocen użytkownika

#### 4.3 Ulubione i Watchlist
- Dodawanie filmów do ulubionych
- Lista "Do obejrzenia"
- Historia oglądania

### 5. System Subskrypcji i Płatności

#### 5.1 Plany Subskrypcji
- Plan darmowy (limited, z reklamami lub tylko trailer)
- Plan podstawowy (SD, 1 device)
- Plan standard (HD, 2 devices)
- Plan premium (4K, 4 devices)

#### 5.2 Integracja Stripe
- Płatność kartą kredytową
- Zarządzanie subskrypcją
- Faktury i historia płatności
- Webhooks dla synchronizacji statusu

#### 5.3 Kontrola Dostępu
- Weryfikacja aktywnej subskrypcji
- Ograniczenie jakości wideo według planu
- Ograniczenie liczby urządzeń

### 6. Panel Administracyjny

#### 6.1 Dashboard
- Statystyki ogólne (liczba użytkowników, filmów, subskrypcji)
- Wykresy: nowi użytkownicy, przychody, najpopularniejsze filmy
- Ostatnia aktywność

#### 6.2 Zarządzanie Filmami
- Lista wszystkich filmów
- Dodawanie nowego filmu:
  - Upload pliku wideo (Supabase Storage)
  - Upload postera i thumbnails
  - Metadane (tytuł, opis, gatunek, rok, etc.)
  - Kategorie i tagi
- Edycja filmu
- Usuwanie filmu
- Publikacja/Unpublish

#### 6.3 Zarządzanie Użytkownikami
- Lista użytkowników z filtrowaniem
- Szczegóły użytkownika
- Zmiana roli (user, admin)
- Blokowanie/Odblokowywanie konta
- Historia subskrypcji użytkownika

#### 6.4 Moderacja Treści
- Lista komentarzy z filtrowaniem
- Usuwanie nieodpowiednich komentarzy
- Ostrzeżenia dla użytkowników

#### 6.5 Zarządzanie Kategoriami
- CRUD kategorii/gatunków
- Przypisywanie filmów do kategorii

#### 6.6 Raporty i Analityka
- Raport przychodów (dzienne, miesięczne, roczne)
- Najpopularniejsze filmy
- Statystyki oglądania
- Export danych do CSV

## Wymagania Niefunkcjonalne

### 1. Wydajność
- Czas ładowania strony głównej < 2s
- Smooth video streaming (buffering < 5%)
- Responsive design (mobile, tablet, desktop)

### 2. Bezpieczeństwo
- HTTPS dla wszystkich połączeń
- Supabase Row Level Security (RLS)
- Walidacja danych po stronie serwera
- Rate limiting dla API
- Ochrona przed XSS, CSRF, SQL Injection
- Bezpieczne przechowywanie haseł (Supabase Auth)

### 3. Skalowalność
- Supabase jako backend (auto-scaling)
- CDN dla treści statycznych
- Optymalizacja bazy danych (indexy)
- Caching (Supabase query caching)

### 4. Dostępność
- WCAG 2.1 Level AA
- Keyboard navigation
- Screen reader support
- Alt text dla obrazów

### 5. Kompatybilność
- Najnowsze 2 wersje Chrome, Firefox, Safari, Edge
- iOS 14+, Android 10+
- Progressive Web App (PWA) optional

## Stack Technologiczny

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui lub Radix UI
- **State Management**: React Context / Zustand
- **Forms**: React Hook Form + Zod
- **Video Player**: Video.js lub Plyr

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Payment**: Stripe

### DevOps
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Hosting Frontend**: Vercel
- **Hosting Backend**: Railway / Render / Fly.io
- **Monitoring**: Sentry (errors), Vercel Analytics

## Schemat Bazy Danych (Supabase)

### Tabele Główne

#### users (rozszerzenie Supabase Auth)
- id (uuid, PK)
- email
- full_name
- avatar_url
- role (user, admin)
- created_at
- updated_at

#### profiles
- id (uuid, PK, FK users.id)
- bio
- subscription_tier (free, basic, standard, premium)
- subscription_status (active, cancelled, expired)
- stripe_customer_id
- created_at
- updated_at

#### videos
- id (uuid, PK)
- title (text)
- description (text)
- video_url (text, Supabase Storage)
- thumbnail_url (text)
- poster_url (text)
- duration (integer, seconds)
- release_year (integer)
- language (text)
- quality (array: SD, HD, 4K)
- published (boolean)
- views_count (integer)
- created_at
- updated_at

#### categories
- id (uuid, PK)
- name (text, unique)
- slug (text, unique)
- description (text)
- created_at

#### video_categories (many-to-many)
- video_id (FK videos.id)
- category_id (FK categories.id)
- PK (video_id, category_id)

#### ratings
- id (uuid, PK)
- user_id (FK users.id)
- video_id (FK videos.id)
- rating (integer, 1-10)
- created_at
- updated_at
- UNIQUE (user_id, video_id)

#### comments
- id (uuid, PK)
- user_id (FK users.id)
- video_id (FK videos.id)
- parent_id (FK comments.id, nullable)
- content (text)
- created_at
- updated_at

#### favorites
- id (uuid, PK)
- user_id (FK users.id)
- video_id (FK videos.id)
- created_at
- UNIQUE (user_id, video_id)

#### watch_history
- id (uuid, PK)
- user_id (FK users.id)
- video_id (FK videos.id)
- watch_position (integer, seconds)
- completed (boolean)
- last_watched_at
- created_at
- updated_at
- UNIQUE (user_id, video_id)

#### subscriptions
- id (uuid, PK)
- user_id (FK users.id)
- stripe_subscription_id (text, unique)
- stripe_price_id (text)
- status (text: active, cancelled, past_due)
- current_period_start (timestamp)
- current_period_end (timestamp)
- cancel_at_period_end (boolean)
- created_at
- updated_at

## Priorytety Implementacji

### MVP (Minimum Viable Product) - Faza 1-5
1. Autentykacja (Supabase Auth)
2. Katalog filmów (lista, szczegóły)
3. Odtwarzacz wideo
4. Podstawowy panel admina (CRUD filmów)

### Faza 2 - Społecznościowe
5. System ocen i komentarzy
6. Ulubione i historia

### Faza 3 - Monetyzacja
7. Integracja Stripe
8. System subskrypcji
9. Kontrola dostępu

### Faza 4 - Rozszerzenia
10. Zaawansowane statystyki
11. Optymalizacja i caching
12. PWA i offline mode


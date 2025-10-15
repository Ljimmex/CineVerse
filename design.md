# Design System - Platforma VOD

## Paleta Kolorów

### Główne Kolory (Dark Theme)
```css
--primary: #E50914;          /* Netflix Red - główny akcent */
--primary-hover: #F40612;    /* Hover state */
--primary-dark: #B20710;     /* Darker variant */

--background: #141414;       /* Główne tło */
--surface: #1F1F1F;          /* Karty, modale */
--surface-elevated: #2A2A2A; /* Elevated components */

--text-primary: #FFFFFF;     /* Główny tekst */
--text-secondary: #B3B3B3;   /* Drugorzędny tekst */
--text-tertiary: #808080;    /* Mniej ważny tekst */

--border: #333333;           /* Obramowania */
--divider: #2A2A2A;          /* Separatory */
```

### Kolory Semantyczne
```css
--success: #46D369;          /* Sukces, aktywna subskrypcja */
--warning: #FFA500;          /* Ostrzeżenia */
--error: #DC2626;            /* Błędy */
--info: #3B82F6;             /* Informacje */
```

### Gradienty
```css
--gradient-hero: linear-gradient(180deg, rgba(20,20,20,0) 0%, rgba(20,20,20,0.8) 50%, rgba(20,20,20,1) 100%);
--gradient-overlay: linear-gradient(0deg, rgba(20,20,20,0.9) 0%, rgba(20,20,20,0) 100%);
```

## Typografia

### Font Family
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-heading: 'Poppins', 'Inter', sans-serif;
--font-mono: 'JetBrains Mono', 'Courier New', monospace;
```

### Font Sizes
```css
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## Spacing

```css
--spacing-1: 0.25rem;    /* 4px */
--spacing-2: 0.5rem;     /* 8px */
--spacing-3: 0.75rem;    /* 12px */
--spacing-4: 1rem;       /* 16px */
--spacing-5: 1.25rem;    /* 20px */
--spacing-6: 1.5rem;     /* 24px */
--spacing-8: 2rem;       /* 32px */
--spacing-10: 2.5rem;    /* 40px */
--spacing-12: 3rem;      /* 48px */
--spacing-16: 4rem;      /* 64px */
--spacing-20: 5rem;      /* 80px */
```

## Border Radius

```css
--radius-sm: 0.25rem;    /* 4px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-full: 9999px;   /* Pills/Circles */
```

## Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.5);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.6);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.7);
--shadow-glow: 0 0 20px rgba(229, 9, 20, 0.3);
```

## Komponenty UI

### Buttons

#### Primary Button
```tsx
className="bg-primary hover:bg-primary-hover text-white font-semibold 
           px-6 py-3 rounded-md transition-colors duration-200 
           active:scale-95 transform"
```

#### Secondary Button
```tsx
className="bg-surface hover:bg-surface-elevated text-white font-semibold 
           px-6 py-3 rounded-md border border-border transition-all duration-200"
```

#### Icon Button
```tsx
className="p-2 rounded-full hover:bg-surface transition-colors duration-200"
```

### Cards

#### Video Card
```tsx
<div className="group cursor-pointer">
  <div className="relative aspect-video rounded-lg overflow-hidden">
    <img src={thumbnail} className="w-full h-full object-cover 
                                     group-hover:scale-110 transition-transform duration-300" />
    <div className="absolute inset-0 bg-black/50 opacity-0 
                    group-hover:opacity-100 transition-opacity duration-200">
      {/* Play icon, info, etc */}
    </div>
  </div>
  <h3 className="mt-2 font-semibold">{title}</h3>
  <p className="text-sm text-secondary">{year} • {duration}</p>
</div>
```

#### Featured Card (Hero)
```tsx
<div className="relative h-screen">
  <img src={backdrop} className="absolute inset-0 w-full h-full object-cover" />
  <div className="absolute inset-0 bg-gradient-hero" />
  <div className="relative z-10 flex items-center h-full max-w-7xl mx-auto px-8">
    {/* Content */}
  </div>
</div>
```

### Forms

#### Input Field
```tsx
<input className="w-full bg-surface border border-border rounded-md px-4 py-3
                  text-white placeholder-text-tertiary
                  focus:outline-none focus:ring-2 focus:ring-primary
                  transition-all duration-200" />
```

#### Select / Dropdown
```tsx
<select className="w-full bg-surface border border-border rounded-md px-4 py-3
                   text-white focus:outline-none focus:ring-2 focus:ring-primary">
  <option>Option 1</option>
</select>
```

### Navigation

#### Header/Navbar
```tsx
<nav className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-sm 
                border-b border-border transition-all duration-300">
  <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
    {/* Logo, Navigation, User Menu */}
  </div>
</nav>
```

#### Sidebar (Admin Panel)
```tsx
<aside className="fixed left-0 top-0 h-screen w-64 bg-surface border-r border-border">
  <div className="p-6">
    {/* Logo */}
  </div>
  <nav className="px-4">
    {/* Navigation items */}
  </nav>
</aside>
```

### Modal/Dialog
```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center">
  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
  <div className="relative bg-surface rounded-xl p-6 max-w-lg w-full mx-4
                  shadow-xl border border-border">
    {/* Modal content */}
  </div>
</div>
```

### Video Player Controls
```tsx
<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t 
                from-black/90 to-transparent p-4">
  <div className="flex items-center gap-4">
    {/* Play/Pause */}
    <button className="p-2 hover:bg-white/20 rounded-full transition">
      <PlayIcon />
    </button>
    
    {/* Progress bar */}
    <div className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer">
      <div className="h-full bg-primary rounded-full" style={{width: '40%'}} />
    </div>
    
    {/* Volume, Fullscreen, etc */}
  </div>
</div>
```

## Layout Structure

### Strona Główna
```
┌─────────────────────────────────────┐
│ Navbar (Logo, Menu, Search, User)   │
├─────────────────────────────────────┤
│                                     │
│  Hero Section (Featured Video)      │
│  - Large backdrop image             │
│  - Title, description               │
│  - Play & Info buttons              │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Trending Now (Horizontal Scroll)   │
│  [Card] [Card] [Card] [Card] →      │
│                                     │
│  Categories                         │
│  [Card] [Card] [Card] [Card] →      │
│                                     │
│  New Releases                       │
│  [Card] [Card] [Card] [Card] →      │
│                                     │
└─────────────────────────────────────┘
│ Footer                              │
└─────────────────────────────────────┘
```

### Strona Filmu (Details)
```
┌─────────────────────────────────────┐
│ Navbar                              │
├─────────────────────────────────────┤
│                                     │
│  Backdrop Image + Gradient          │
│                                     │
│  ┌─────────┐  Title                │
│  │ Poster  │  Description           │
│  │         │  Year • Duration       │
│  │         │  Genre Tags            │
│  └─────────┘                        │
│  [▶ Play] [+ My List] [Rate]       │
│                                     │
├─────────────────────────────────────┤
│  Tabs: [Overview] [Comments]        │
│                                     │
│  Cast & Crew                        │
│  Similar Videos                     │
│                                     │
└─────────────────────────────────────┘
```

### Admin Dashboard
```
┌──────┬──────────────────────────────┐
│      │ Header (Search, User)        │
│ Side ├──────────────────────────────┤
│ bar  │                              │
│      │  Stats Cards                 │
│ Nav  │  [Users] [Videos] [Revenue]  │
│      │                              │
│      │  Charts                      │
│      │  - User Growth               │
│      │  - Revenue                   │
│      │                              │
│      │  Recent Activity             │
│      │  [Table]                     │
│      │                              │
└──────┴──────────────────────────────┘
```

## Responsywność

### Breakpoints
```css
--screen-sm: 640px;   /* Mobile */
--screen-md: 768px;   /* Tablet */
--screen-lg: 1024px;  /* Laptop */
--screen-xl: 1280px;  /* Desktop */
--screen-2xl: 1536px; /* Large Desktop */
```

### Grid System
```tsx
// Mobile: 1-2 columns
// Tablet: 3-4 columns
// Desktop: 4-6 columns

className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
```

## Animations & Transitions

### Hover Effects
```css
/* Card Hover */
.video-card:hover {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}

/* Button Hover */
.button:hover {
  box-shadow: 0 0 20px rgba(229, 9, 20, 0.4);
  transition: box-shadow 0.3s ease;
}
```

### Loading States
```tsx
// Skeleton loader for video cards
<div className="animate-pulse">
  <div className="aspect-video bg-surface-elevated rounded-lg" />
  <div className="h-4 bg-surface-elevated rounded mt-2 w-3/4" />
  <div className="h-3 bg-surface-elevated rounded mt-1 w-1/2" />
</div>
```

### Page Transitions
```tsx
// Framer Motion example
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>
```

## Ikony

**Biblioteka**: Lucide React / Heroicons

Główne ikony:
- Play (▶)
- Pause (⏸)
- Heart (♥) - Favorites
- Search (🔍)
- User (👤)
- Settings (⚙)
- Star (⭐) - Ratings
- Comment (💬)
- Menu (☰)
- Close (✕)

## Accessibility (a11y)

### Focus States
```css
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### ARIA Labels
```tsx
<button aria-label="Play video">
  <PlayIcon />
</button>

<img src={poster} alt={`${title} poster`} />
```

### Keyboard Navigation
- Tab: Focus kolejne elementy
- Enter/Space: Aktywacja przycisków
- Escape: Zamknięcie modali
- Arrow keys: Nawigacja w odtwarzaczu

## Performance Optimizations

### Image Optimization
- Next.js Image component z lazy loading
- WebP format z fallback do JPG
- Responsive images (srcset)
- Blur placeholder

### Video Optimization
- HLS adaptive bitrate streaming
- Poster images dla preview
- Lazy load video player
- Preload tylko dla featured content

### Code Splitting
- Dynamic imports dla modali
- Route-based splitting
- Component lazy loading

## Dark/Light Mode (Opcjonalnie)

Obecnie fokus na dark mode, ale struktura gotowa na light mode:
```css
[data-theme="light"] {
  --background: #FFFFFF;
  --surface: #F5F5F5;
  --text-primary: #000000;
  /* etc */
}
```


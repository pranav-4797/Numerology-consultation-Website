# 🌌 AGENTS.md — Divya Urja Project Guide & Codebase Overview

This document serves as a token-efficient, comprehensive architecture map, data model guide, component directory, and instruction set for AI coding agents working on the **Divya Urja** repository.

---

## 1. Executive Summary & Tech Stack

**Divya Urja** is a full-stack digital platform for holistic consultation services (Numerology, Vastu Shastra, Energy Science). It comprises:
1. **Multi-lingual Public Website** (English, Hindi, Marathi) with online appointment booking, workshop registrations, spiritual product catalogue with checkout, educational blogs, and photo gallery.
2. **Protected Admin Dashboard** for client pipeline management, consultation appointments, content CRUD (blogs, workshops, events, testimonials, products), e-commerce order fulfillment, site settings configuration, and a built-in Numerology report/PDF generator.

### Technology Stack
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) + Lucide React icons + Framer Motion
- **Database & Auth**: Firebase Firestore (v12 Web SDK) + Firebase Authentication (Email/Password) + Firebase Hosting
- **Forms & Validation**: React Hook Form + Zod (`src/schemas/index.ts`)
- **UI Notifications**: Sonner (`toast`)
- **Testing**: Vitest (`npm run test`)
- **Numerology Engine**: Custom calculation modules & PDF generator (`src/services/numerology/`)

---

## 2. Codebase Architecture & File Tree

```
/
├── public/                     # Static assets & public images (logo.jpg, SVGs)
├── src/
│   ├── app/                    # Next.js App Router Pages & Routes
│   │   ├── (public)/           # Public layout group & customer-facing pages
│   │   │   ├── page.tsx        # Dynamic Homepage (Hero, Services, Workshops, Products, Blogs, Testimonials)
│   │   │   ├── about/          # About Us & Founder profile page
│   │   │   ├── blog/           # Blog directory & single post [slug] view page
│   │   │   ├── book/           # Service appointment booking form page
│   │   │   ├── catalogue/      # E-commerce catalogue (Bracelets, Crystals, Yantras, Rudraksha)
│   │   │   ├── checkout/       # Product checkout & order creation page
│   │   │   ├── contact/        # Contact form (creates Lead in Firestore)
│   │   │   ├── events/         # Upcoming events list & details page
│   │   │   ├── gallery/        # Photo gallery grid & lightbox viewer page
│   │   │   ├── services/       # Services list & detailed modal view page
│   │   │   ├── testimonials/   # Client reviews & rating page
│   │   │   └── workshops/      # Workshop schedule & seat booking modal page
│   │   ├── admin/              # Protected Admin Dashboard routes
│   │   │   ├── page.tsx        # Admin Dashboard summary stats overview
│   │   │   ├── login/          # Firebase Admin Login page
│   │   │   ├── appointments/   # Manage client appointments & status pipeline
│   │   │   ├── blogs/          # Markdown blog post editor & published state manager
│   │   │   ├── events/         # Event listing CRUD
│   │   │   ├── gallery/        # Photo gallery CRUD
│   │   │   ├── leads/          # Contact submissions pipeline & lead conversion tracker
│   │   │   ├── numerology-calculator/ # Numerology report compiler & PDF download utility
│   │   │   ├── orders/         # E-commerce store orders & fulfillment tracking
│   │   │   ├── products/       # Store products CRUD (inventory, price, stock, category)
│   │   │   ├── registrations/  # Workshop participant roster
│   │   │   ├── services/       # Consultative services CRUD
│   │   │   ├── settings/       # Global website settings (Hero text, contacts, section toggles)
│   │   │   ├── testimonials/   # Testimonial reviews CRUD
│   │   │   └── workshops/      # Workshop scheduling & seat limit CRUD
│   │   ├── globals.css         # Tailwind CSS v4 directives & custom theme rules
│   │   ├── layout.tsx          # Root HTML layout (Fonts, LanguageProvider, AuthProvider)
│   │   ├── robots.ts           # SEO Robots directives
│   │   └── sitemap.ts          # Dynamic XML Sitemap generator
│   ├── components/             # Reusable React UI Components
│   │   ├── admin/              # Admin Dashboard UI (AdminSidebar, AdminNavbar, ProtectedRoute, DeleteConfirmModal)
│   │   ├── layout/             # Main site header (Navbar) & Footer
│   │   └── ui/                 # Reusable UI elements (Hero, ServiceCard, WorkshopCard, BlogCard, ProductCard, Lightbox, etc.)
│   ├── context/                # Global React State Contexts
│   │   ├── AuthContext.tsx     # Firebase Auth subscriber (user state, loading, logout)
│   │   └── LanguageContext.tsx # i18n locale manager ('en' | 'hi' | 'mr') with localStorage persistence
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useFirestore.ts     # Generic Firestore collection query hook
│   │   ├── useIsMobile.ts      # Responsive viewport detection hook
│   │   └── useSiteSettings.ts  # Site settings fetch & active feature toggle hook
│   ├── i18n/                   # Internationalization
│   │   └── translations.ts     # EN, HI, MR dictionary mapping
│   ├── lib/                    # Infrastructure Libraries
│   │   └── firebase.ts         # Firebase App, Auth, & Firestore initialization
│   ├── schemas/                # Form Validation Schemas
│   │   └── index.ts            # Zod validation schemas for forms across the app
│   ├── services/               # Data Layer & Business Logic
│   │   ├── firestore.ts        # Primary Firestore CRUD functions & atomic transactions
│   │   ├── storage.ts          # Firebase Storage helpers
│   │   ├── numerologyFirestore.ts # Numerology record persistence
│   │   └── numerology/         # Numerology Calculation & PDF Generation Engine
│   │       ├── birthNumber.ts  # Driver/Psychic number calculation
│   │       ├── destinyNumber.ts# Conductor/Life path calculation
│   │       ├── loshu.ts        # Loshu grid matrix & missing number analysis
│   │       ├── vedic.ts        # Vedic grid & planetary lord calculations
│   │       ├── lucky.ts        # Lucky colors, days, numbers, gem recommendations
│   │       ├── pdfGenerator.ts # PDF layout & generation engine
│   │       ├── reportGenerator.ts # Full consultation report compilation
│   │       └── ...             # Arrows, Personal Year, Soul Urge, Name Number modules
│   ├── types/                  # TypeScript Interfaces
│   │   └── index.ts            # Application-wide data models (Service, Workshop, Appointment, Order, Lead, etc.)
│   └── utils/                  # Helper Utilities
│       ├── helpers.ts          # Date, currency, string formatting helpers
│       ├── imageUtils.ts       # Client-side image compression & base64 conversion
│       └── markdown.ts         # Lightweight markdown compiler for blog posts
├── firestore.rules             # Database security policies
├── storage.rules               # Storage security policies
├── firebase.json               # Firebase Hosting & Firestore deployment setup
└── next.config.ts              # Next.js configuration
```

---

## 3. Core Data Schemas & Types (`src/types/index.ts`)

| Type Name | Primary Fields | Firestore Collection |
| :--- | :--- | :--- |
| `Service` | `id`, `title`, `image`, `description`, `benefits[]`, `featured`, `fees` | `services` |
| `Workshop` | `id`, `title`, `description`, `date`, `time`, `venue`, `fees`, `availableSeats`, `image` | `workshops` |
| `Event` | `id`, `title`, `description`, `date`, `time`, `location`, `poster` | `events` |
| `Blog` | `id`, `title`, `slug`, `excerpt`, `content` (Markdown), `coverImage`, `status` (`'draft' \| 'published'`), `publishedAt` | `blogs` |
| `Testimonial` | `id`, `name`, `photo`, `review`, `rating` (1-5) | `testimonials` |
| `GalleryImage` | `id`, `url`, `caption` | `gallery` |
| `ContactSubmission` (`Lead`) | `id`, `name`, `phone`, `email`, `message`, `service`, `status` (`'new' \| 'contacted' \| 'converted' \| 'closed'`), `notes`, `followUpDate` | `leads` |
| `Appointment` | `id`, `name`, `phone`, `email`, `serviceId`, `serviceTitle`, `fees`, `date`, `timeSlot`, `birthdate`, `personalityNumber`, `destinyNumber`, `zodiacSign`, `message`, `status` (`'pending' \| 'confirmed' \| 'completed' \| 'cancelled'`), `paid` | `appointments` |
| `WorkshopRegistration` | `id`, `workshopId`, `workshopTitle`, `name`, `phone`, `email`, `status` (`'registered' \| 'confirmed' \| 'cancelled'`), `paid` | `registrations` |
| `Product` | `id`, `name`, `description`, `price`, `category` (`'bracelets' \| 'crystals' \| 'yantras' \| 'rudraksha' \| 'pendants' \| 'other'`), `image`, `inStock`, `featured` | `products` |
| `Order` | `id`, `name`, `phone`, `email`, `address`, `district`, `state`, `pincode`, `items[]`, `subtotal`, `shippingCharges`, `total`, `status` (`'pending' \| 'completed' \| 'cancelled'`) | `orders` |
| `SiteSettings` | `phone`, `whatsapp`, `email`, `address`, `workingHours`, `facebook`, `instagram`, `youtube`, `heroTitle`, `heroSubtitle` | `settings` (`main` doc) |

---

## 4. Key Architectural Patterns & Workflows

### 4.1 Internationalization (i18n)
- `LanguageContext` (`src/context/LanguageContext.tsx`) provides current language (`'en' | 'hi' | 'mr'`), `setLanguage`, and dictionary lookup `t(key)`.
- Translations are centralized in `src/i18n/translations.ts`.
- When adding new visible text to any component, ensure dictionary keys exist for English, Hindi, and Marathi.

### 4.2 Authentication & Protection
- Admin routes (`/admin/*` excluding `/admin/login`) are wrapped in `ProtectedRoute` (`src/components/admin/ProtectedRoute.tsx`).
- `AuthContext` handles Firebase Authentication state. Unauthenticated visitors attempting to access dashboard routes are redirected to `/admin/login`.

### 4.3 Atomic Operations & Transactions
- Workshop registration utilizes `runTransaction` in `src/services/firestore.ts` to atomically check and decrement `availableSeats` on the workshop document while writing a new registration entry, preventing overselling race conditions.

### 4.4 Form Handling & Validation
- Standard pattern: `useForm` from `react-hook-form` integrated with `zodResolver` from `@hookform/resolvers/zod`.
- Zod schemas live in `src/schemas/index.ts`.

### 4.5 Numerology Engine (`src/services/numerology/`)
- Contains pure calculation logic independent of UI components.
- Modules output structured objects for Loshu grid layout, Vedic grid planetary aspects, missing numbers, and PDF exports.

---

## 5. Security Model (`firestore.rules`)
- **Public Read**: `services`, `workshops`, `events`, `blogs`, `testimonials`, `gallery`, `products`, `settings`.
- **Public Write**:
  - `leads`, `appointments`, `orders`: Public creation is permitted (validated by security rule field rules).
  - `workshops`: Public users can only decrement `availableSeats` by 1 via atomic transaction.
- **Admin Write**: Full access granted to authenticated admin (`request.auth != null`).

---

## 6. Conventions for AI Agents

1. **Path Import Aliases**: Always use `@/` alias for internal imports (e.g. `@/components/ui/ProductCard`, `@/services/firestore`, `@/types`).
2. **Firestore API Usage**: Do not invoke raw Firestore `doc` / `getDoc` inside UI components; use exported functions from `src/services/firestore.ts`.
3. **Component Structure**:
   - Maintain client component boundaries using `'use client'` at the top of interactive components.
   - Keep page files in `src/app/` lean by delegating visual sections to components in `src/components/`.
4. **Form Modifications**: Always keep Zod schemas (`src/schemas/index.ts`) in sync with form inputs and TypeScript interfaces.
5. **Styling Standards**: Use Tailwind CSS v4 classes and Lucide React icons. Avoid inline styles unless computing dynamic position/aspect ratios.

---

## 7. Useful Development Commands

```bash
# Start local dev server
npm run dev

# Run Vitest test suite
npm run test

# Check code formatting & linting
npm run lint

# Build production distribution
npm run build

# Deploy Hosting assets & Firestore Security Rules
firebase deploy --only hosting,firestore
```

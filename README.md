# Rajat Poddar — Portfolio + Business OS

> A full-stack portfolio website combined with a private admin dashboard — built for Indian small businesses and entrepreneurs. Features AI-powered quotation generation, invoice management, client CRM, lead tracking, and a Hinglish/English language toggle.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://docker.com)

---

## Live Demo

| Route | Description |
|-------|-------------|
| `/` | Public portfolio (Hinglish + English) |
| `/login` | Admin login |
| `/dashboard` | Private Business OS |

---

## What's Inside

### Public Portfolio (`/`)
- **Hero** — Hinglish headline with animated gradient orbs, WhatsApp CTA, live stats
- **About** — Story-driven section with metrics card
- **Who Can Use** — Indian business types (mithai shop, kirana, restaurant, salon, etc.)
- **Services** — 5 service cards with Problem / Samadhan / Fayda breakdown
- **Benefits** — 4 benefit cards (Time Bachega, Poora Control, Hisaab Saaf, Tezi Se Badho)
- **Projects** — 4 real case studies with business impact
- **Skills** — Interactive tabbed skill bars
- **Process** — 5-step process with connecting timeline
- **Testimonials** — Indian client testimonials
- **Contact** — Lead capture form → saves to Supabase, WhatsApp CTA with pre-filled message
- **Language Toggle** — 🇮🇳 Hinglish / 🇬🇧 English switch in navbar

### Private Dashboard (`/dashboard`) — Admin Only
- **Overview** — Revenue, clients, quotations, invoices, leads at a glance
- **Clients** — Full CRM: add, edit, delete, WhatsApp link
- **Quotations** — Multi-step builder with feature selector, dynamic pricing, PDF export, WhatsApp share, duplicate
- **Invoices** — Create invoices with discount (flat/%), live calculation, PDF export, mark paid
- **Leads** — Auto-captured from contact form, status pipeline, one-click convert to client
- **Pricing Settings** — Edit feature prices stored in Supabase (no hardcoded values)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion 12 |
| Auth | Supabase Auth |
| Database | Supabase (PostgreSQL) |
| PDF Export | jsPDF (pure JS, no html2canvas) |
| Routing | React Router v7 |
| i18n | Custom context-based (EN / Hinglish) |
| Deployment | Docker + Nginx |

---

## Project Structure

```
src/
├── components/
│   ├── auth/           # ProtectedRoute
│   ├── tools/          # FeatureSelector
│   ├── ui/             # Toast notifications
│   ├── About.jsx
│   ├── Benefits.jsx    # NEW — Indian business benefits
│   ├── Contact.jsx
│   ├── Footer.jsx
│   ├── Hero.jsx
│   ├── Navbar.jsx      # Language toggle
│   ├── Process.jsx
│   ├── Projects.jsx
│   ├── Services.jsx
│   ├── Skills.jsx
│   ├── Testimonials.jsx
│   └── WhoCanUse.jsx   # NEW — Indian business types
├── context/
│   └── AuthContext.jsx
├── data/
│   ├── features.js     # Feature groups for selector
│   ├── index.js        # All content (Hinglish + EN)
│   └── pricingLogic.js # Base prices + maintenance plans
├── hooks/
│   └── useInView.js
├── i18n/
│   ├── LangContext.jsx  # Language provider
│   └── translations.js  # Full EN + Hinglish strings
├── lib/
│   ├── auth.js
│   ├── db.js           # Supabase DB helpers
│   └── supabase.js
├── pages/
│   ├── dashboard/
│   │   ├── Clients.jsx
│   │   ├── DashboardLayout.jsx
│   │   ├── Invoices.jsx
│   │   ├── Leads.jsx
│   │   ├── Overview.jsx
│   │   ├── PricingSettings.jsx
│   │   └── Quotes.jsx
│   ├── Login.jsx
│   └── PublicSite.jsx
└── services/
    ├── pdfService.js      # jsPDF quotation + invoice export
    └── pricingService.js  # Dynamic pricing from Supabase
supabase/
├── schema.sql             # Full DB schema with RLS
└── migration_v2.sql       # Migration for existing DBs
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/rajatpoddar/Portfolio.git
cd Portfolio
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in your Supabase project → **Settings → API**.

### 3. Set Up Database

Run `supabase/schema.sql` in your Supabase **SQL Editor**.

> Already ran it before? Run `supabase/migration_v2.sql` instead — it only adds new columns and tables safely.

### 4. Create Admin User

Supabase Dashboard → **Authentication → Users → Add user**

Use those credentials at `/login`.

### 5. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Docker Deployment

### Build & Run

```bash
# Copy and fill in your env vars
cp .env.example .env

# Build and start
docker compose up -d --build
```

App runs at [http://localhost:3000](http://localhost:3000)

### Build Image Only

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=your_url \
  --build-arg VITE_SUPABASE_ANON_KEY=your_key \
  -t rajat-portfolio .
```

> **Note:** Vite embeds env vars at build time. Pass them as `--build-arg` when building the Docker image.

---

## Database Schema

```sql
clients       — id, name, business, email, phone, notes
quotations    — id, quote_number, client_id, project_type, features[], maintenance, total_amount, status
invoices      — id, invoice_number, client_id, project_name, total_amount, paid_amount, due_amount,
                discount_type, discount_value, discount_amount, due_date, status
leads         — id, name, email, phone, company, message, status
pricing       — id, feature_name, price  (editable from dashboard)
```

Row Level Security is enabled on all tables. Leads allow public insert (contact form). Everything else requires authentication.

---

## Key Features

### PDF Export
Quotations and invoices export as professional dark-themed PDFs using pure jsPDF — no browser rendering, no html2canvas issues. Works reliably in all environments.

### Dynamic Pricing
Feature prices are stored in Supabase and editable from the dashboard's Pricing Settings page. Quotations always use the latest prices. Falls back to hardcoded defaults if the table is empty.

### Hinglish i18n
Full EN ↔ Hinglish toggle. Every string on the public site is translated. The language context is provided at the app root so any component can call `useLang()`.

### Lead Pipeline
Contact form submissions are automatically saved as leads in Supabase. From the dashboard, leads can be moved through a status pipeline (new → contacted → converted → closed) and converted to clients with one click.

---

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | ✅ |

---

## Contact

**Rajat Poddar**

- 📧 [solutionspoddar@gmail.com](mailto:solutionspoddar@gmail.com)
- 💬 [WhatsApp](https://wa.me/917250580175)
- 🐙 [GitHub](https://github.com/rajatpoddar)

---

## License

This project is private. All rights reserved © 2026 Rajat Poddar.

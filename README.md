# BAFCO Food Plant Platform 🏢

**BAFCO Food Plant** — Full-Stack Corporate Website

## 📋 Architecture

```
web_saite/
├── client/                 # React + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/     # Reusable UI (Header, Footer, ProductCard, etc.)
│   │   ├── pages/          # Route pages (Home, Products, Careers, etc.)
│   │   ├── services/       # Axios API client
│   │   ├── hooks/          # Custom React hooks
│   │   ├── i18n/           # Arabic/English translations + RTL support
│   │   └── types/          # TypeScript type definitions
├── server/                 # Node.js + Express + TypeScript + Prisma
│   ├── prisma/             # Database schema + migrations + seed
│   ├── src/
│   │   ├── routes/         # API endpoints (auth, products, careers, etc.)
│   │   ├── middleware/     # JWT auth, Joi validation
│   │   └── utils/          # Prisma client, cache (Redis), upload, errors
├── docker-compose.yml      # PostgreSQL + Redis (optional)
└── start.bat               # Quick start script
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

### 1. Start Database (optional — SQLite used by default)
```bash
docker-compose up -d   # PostgreSQL + Redis
```

### 2. Install Dependencies
```bash
cd server && npm install
cd ../client && npm install
cd ..
npm install
```

### 3. Setup Database
```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
cd ..
```

### 4. Run the Project
```bash
# Option A: Double-click start.bat
# Option B: Run manually
cd server && npx tsx src/index.ts    # Terminal 1
cd client && npx vite                # Terminal 2
```

### 5. Open Browser
- **Frontend:** http://localhost:5173
- **API:** http://localhost:3000/api

## 🔑 Default Admin Login
- **Email:** admin@bafco.com
- **Password:** Admin@12345

## 🧩 Features

| Module | Description |
|--------|-------------|
| **Homepage** | Hero section, animated stats counter, news grid, sustainability |
| **Products** | Filterable grid by category, nutrition facts table, allergens, SKU |
| **Careers** | Job listings by department, CV upload (PDF/DOC), application form |
| **Investors** | Financial reports, stock ticker widget, governance docs |
| **Contact** | General inquiry form, B2B distributor/supplier form with file upload |
| **Dashboard** | Admin panel for product/category management |

## 🌐 Internationalization
- **RTL/LTR:** Automatic based on language selection
- **Languages:** Arabic (العربية) / English
- Translations in `client/src/i18n/`

## 🛠️ Tech Stack
- **Frontend:** React 18, TypeScript, Tailwind CSS 3, Vite 6
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** SQLite (dev) / PostgreSQL (prod) via Prisma
- **Cache:** Redis (optional, graceful fallback)
- **Validation:** Joi schemas
- **Auth:** JWT tokens (bcryptjs)
- **File Upload:** Multer
- **Security:** Helmet, CORS, Rate Limiting, Compression

## 📡 API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/register` | — | Register admin |
| GET | `/api/auth/me` | JWT | Current user |
| GET | `/api/products` | — | List products (cached) |
| GET | `/api/products/:slug` | — | Product detail |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/categories` | — | List categories (cached) |
| POST | `/api/categories` | Admin | Create category |
| GET | `/api/careers/jobs` | — | List open jobs |
| POST | `/api/careers/apply` | — | Apply with CV |
| GET | `/api/careers/applications` | Admin | View applications |
| POST | `/api/contact/inquiry` | — | Send inquiry |
| POST | `/api/contact/b2b` | — | B2B inquiry |
| GET | `/api/investors/documents` | — | Investor documents |
| GET | `/api/investors/news` | — | News articles |

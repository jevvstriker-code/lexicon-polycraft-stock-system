# Lexicon Polycraft Stock Verification & Mobile Round System

A Next.js (App Router + TypeScript + Tailwind CSS) inventory management and floor verification web application for Lexicon Polycraft's 304 SKU catalog with sets, bundles, and inner packaging support. Built with MVC architecture and dedicated PostgreSQL schema isolation (`lexicon_polycraft_app`) on Supabase.

---

## 🌟 Key Features

1. **Dashboard & Analytics**
   - Live KPI overview (Total SKUs, Low Stock, Overstock, Runner turnover items, Repeater / Stranger breakdown).
   - Real-time stock volume distribution bars.
   - Activity audit log of recent production entries, dispatches, and physical audit counts.

2. **Inventory Master Catalog (304 SKUs)**
   - Complete 304 plastic product catalog pre-seeded in PostgreSQL.
   - Packaging support for Sets (e.g., 3-pc container sets), Bundles, and Inner Packaging.
   - Real-time search, category filtering, FSN classification filtering, and stock status filters.
   - Full CRUD: Add Product, Edit SKU, and Delete.
   - Excel Import/Export with SheetJS (`.xlsx`, `.xls`, `.csv`).

3. **📱 Mobile Stock Round Walkthrough**
   - Mobile floor-optimized card walkthrough for shop-floor stock auditors.
   - Audit products by Sets, Bundles, Inner Boxes, or Loose Pieces.
   - Real-time total piece calculation and instant "Verify / Re-Verify" audit logging.
   - Live progress indicator (`X / 304 Verified`).

4. **Stock Adjustment & Counting Sheet**
   - Transaction entry: Production (Stock In), Delivery / Dispatch (Stock Out), and Physical Audit (Set Exact).
   - Dynamic unit calculation: Enter quantity in Sets/Bundles or loose pieces.
   - Live editable counting sheet with quick verify buttons.

5. **A4 Printable Verification Report**
   - Official formatted printable A4 document (`window.print()`).
   - Clean tabular overview with sign-offs for Store Keeper, Production Manager, and Plant Head.

6. **Google Sheets Sync Integration**
   - Export to Excel and upload to Google Drive, or connect a Google Apps Script Webhook endpoint for live team collaboration.

---

## 🏛️ Architecture (MVC)

- **Models (`models/`)**: Domain models and validations (`ProductModel`, `ActivityLogModel`, `RoundVerificationModel`).
- **Views (`components/`, `app/page.tsx`)**: Reusable React components structured by domain (`components/tabs/`, `components/forms/`, `components/ui/`).
- **Controllers (`controllers/`)**: Business logic orchestration (`InventoryController`).
- **Services (`services/supabase/`)**: Database access layer (`InventoryService`).
- **Database Schema Isolation**: Scoped PostgreSQL schema (`lexicon_polycraft_app`) in Supabase.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node 24)
- npm

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_SUPABASE_SCHEMA=lexicon_polycraft_app
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Production Build & Lint
```bash
npm run lint
npm run build
```

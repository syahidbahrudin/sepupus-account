# 🧾 Internal Accounting Application — Context

## 🚀 Overview

This is an **internal accounting system** built for company use only.  
All receipts, invoices, and payment records will be stored and managed inside this app.

The goal:

- Centralize all company financial data (no more spreadsheets).
- Automate tracking of income, expenses, and balances.
- Provide simple dashboards and reports for the admin.

---

## 🧠 Tech Stack

### Web Framework

- **Next.js** (App Router)
  - Server Actions enabled
  - API routes for tRPC integration
  - Uses React Server Components where possible

### Backend

- **tRPC**
  - Type-safe API calls (no REST endpoints)
  - Handles CRUD logic for accounting entities (receipt, invoice, expense, etc.)

### Database

- **PostgreSQL** (via Supabase)
  - Hosted database + storage
  - All financial data stored here (normalized schema)

### ORM / Schema

- **Drizzle ORM**
  - Handles migrations, schema definitions, and type-safe queries
  - Integrates with PostgreSQL

### Infra / Workspace

- **Turborepo**
  - Monorepo structure
  - Separate packages for:
    - `/apps/web` → frontend
    - `/packages/db` → drizzle schema + migrations
    - `/packages/trpc` → backend logic
    - `/packages/ui` → shared components (if needed)
- **pnpm**
  - For dependency management

---

## 📁 Folder Structure (Planned)

root/
├── apps/
│ ├── web/ # Next.js frontend (main app)
│ │ ├── app/  
│ │ │ │
│ │ │ ├── dashboard/
│ │ │ ├── receipts/
│ │ │ ├── inventory/
│ │ │ ├── products/
│ │ │ ├── analytics/
│ │ │ └── chatbot/
│ │ ├── components/
│ │ ├── styles/
│ │ ├── utils/
│ │ └── trpc/ # tRPC client setup
│ │
│ └── admin/ # (optional) Separate admin interface
│
├── packages/
│ ├── db/ # Drizzle schema + migrations
│ │ ├── schema/
│ │ │ ├── users.ts
│ │ │ ├── receipts.ts
│ │ │ ├── invoices.ts
│ │ │ ├── expenses.ts
│ │ │ ├── payments.ts
│ │ │ ├── products.ts
│ │ │ ├── product_ingredients.ts
│ │ │ ├── inventory.ts
│ │ │ ├── analytics_snapshots.ts
│ │ │ └── categories.ts
│ │ └── drizzle.config.ts
│ │
│ ├── trpc/ # Backend logic
│ │ ├── routers/
│ │ │ ├── receipts.ts
│ │ │ ├── invoices.ts
│ │ │ ├── expenses.ts
│ │ │ ├── products.ts
│ │ │ ├── inventory.ts
│ │ │ ├── analytics.ts
│ │ │ ├── chatbot.ts
│ │ │ └── users.ts
│ │ └── context.ts
│ │
│ └── ui/ # Shared UI components
│ ├── Button.tsx
│ ├── Card.tsx
│ └── Table.tsx
│
└── turbo.json

---

## 🧩 Core Modules

### 1. Receipts & Transactions

- Upload image/PDF of receipts
- Store itemized details (each product purchased)
- Each receipt updates:
  - **Income/Expense tables**
  - **Inventory stock levels**

### 2. Analytics Dashboard

Visual dashboards that summarize financial performance:

- **Short Money Tracker** → shows quick balance summary
- **Daily Income** → chart of today’s total income vs expenses
- **Monthly Income** → bar chart showing each month’s total profit/loss
- **Yearly Income** → trend line for yearly financial growth

Each chart pulls real-time data via `reportRouter` in tRPC.

### 3. Inventory System

Handles both **assets** and **consumables**.

#### Features:

- Add, update, or delete inventory items
- Track stock levels for each product or material
- Supports:
  - **Kekal (Fixed Assets)** — long-term assets (e.g., equipment)
  - **Tidak Kekal (Consumables)** — used in operations (e.g., ingredients)

When a purchase occurs (via receipt), related inventory items are **deducted** automatically.

Example:
Product: Nasi Cik Ani
Requires:

1 Potong Ayam

200g Nasi Putih

1 Bekas Makanan

When a sale of `Nasi Cik Ani` is recorded, the system automatically deducts those quantities from inventory.

### 4. Product Module

- Manage all sellable items (products/services)
- Define cost structure + required inventory components
- Links with receipts and inventory
- Example fields:

name: string
price: number
ingredients: [{ inventory_id, quantity }]

### 5. Chatbot (Finance Assistant)

AI chatbot trained on:

- All company accounting, income, and expenses data
- Product sales
- Inventory usage
- Daily, monthly, and yearly analytics

It should:

- Must be Agentic
- Using vercel AI SDK
- Have a tool to CRUD Every Feature in the dashboar
- Using OpenAI gpt-5-mini model
- Answer questions like “berapa total income bulan ni?”
- Explain where expenses went
- Summarize financial health
- Retrieve data directly from Postgres (via tRPC endpoint)
- (Optional later) Use embedding search for natural queries

---

## 📊 tRPC Routers Overview

| Router            | Purpose                                   |
| ----------------- | ----------------------------------------- |
| `userRouter`      | User roles & profile                      |
| `receiptRouter`   | CRUD receipts + link to product purchases |
| `productRouter`   | Manage product definitions                |
| `inventoryRouter` | Track items, auto-deduct after purchase   |
| `analyticsRouter` | Handle all financial chart data           |
| `chatbotRouter`   | Provide data access for AI queries        |
| `reportRouter`    | Generate CSV / PDF summaries              |

---

## 🧱 Database Schema (Extended)

### `users`

| Column | Type                             | Notes  |
| ------ | -------------------------------- | ------ |
| id     | uuid                             | PK     |
| email  | text                             | unique |
| name   | text                             |        |
| role   | enum('admin','finance','viewer') |        |

### `products`

| Column     | Type      | Notes |
| ---------- | --------- | ----- |
| id         | uuid      | PK    |
| name       | text      |       |
| price      | decimal   |       |
| category   | text      |       |
| created_at | timestamp |       |

### `product_ingredients`

| Column       | Type    | Notes                            |
| ------------ | ------- | -------------------------------- |
| id           | uuid    | PK                               |
| product_id   | uuid    | FK → products.id                 |
| inventory_id | uuid    | FK → inventory.id                |
| quantity     | decimal | Amount deducted per product sold |

### `inventory`

| Column        | Type                        | Notes           |
| ------------- | --------------------------- | --------------- |
| id            | uuid                        | PK              |
| name          | text                        |                 |
| type          | enum('kekal','tidak_kekal') |                 |
| quantity      | decimal                     | current stock   |
| unit          | text                        | e.g., gram, pcs |
| cost_per_unit | decimal                     |                 |
| last_updated  | timestamp                   |                 |

### `receipts`

| Column     | Type                     | Notes                      |
| ---------- | ------------------------ | -------------------------- |
| id         | uuid                     | PK                         |
| title      | text                     |                            |
| total      | decimal                  |                            |
| date       | date                     |                            |
| type       | enum('income','expense') |                            |
| items      | jsonb                    | list of purchased products |
| created_by | uuid                     | FK → users.id              |

### `analytics_snapshots`

| Column         | Type    | Notes                 |
| -------------- | ------- | --------------------- |
| id             | uuid    | PK                    |
| date           | date    | snapshot date         |
| daily_income   | decimal |                       |
| monthly_income | decimal |                       |
| yearly_income  | decimal |                       |
| short_money    | decimal | total available funds |

---

## 📈 Analytics Logic

**Short Money**

- `total_income - total_expense`

**Daily Income**

- Sum of `receipts.total` where `type = 'income'` and `date = today`

**Monthly Income**

- Group by month, sum of income transactions

**Yearly Income**

- Aggregate yearly income + expense comparison

**Total Fixed Asset**

- Can get from inventory

---

## 🤖 Chatbot System

### Purpose

AI assistant that understands the company’s:

- Expenses
- Sales
- Inventory
- Income trends

### How It Works

1. Backend builds an **embeddings knowledge base** (expenses, receipts, products).
2. Chatbot uses tRPC endpoint `chatbotRouter.ask()` to:

- Retrieve structured answers from DB
- Or fall back to vector search for context

3. Uses OpenAI or Anthropic model to respond naturally with up-to-date numbers.

### Example Prompts

> “Berapa total income minggu ni?”
> “Barang apa paling banyak digunakan bulan ni?”
> “Berapa baki duit sekarang?”

---

---

## 🧰 Dev Notes

- All analytics use **Drizzle SQL aggregates**
- Recharts or Nivo for visual charts
- Supabase Storage for receipt images
- Chatbot powered by **OpenAI / Anthropic via server actions**
- Inventory deduction logic triggered after successful transaction save
- Transactions wrapped in DB transaction (atomic updates)

---

## 🧑‍💻 Commands

| Task            | Command            |
| --------------- | ------------------ |
| Dev server      | `pnpm dev`         |
| Generate types  | `pnpm db:generate` |
| Push migrations | `pnpm db:push`     |
| Lint            | `pnpm lint`        |

---

## 📅 Future Enhancements

- Auto tax report generation
- Multi-branch (multi-organization) mode
- API sync with POS system
- AI forecasting for sales trends

---

## 📜 License

Internal proprietary software. Not for external distribution.

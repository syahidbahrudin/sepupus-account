# Setup Instructions

## Prerequisites

- Node.js 18+ and pnpm installed
- Supabase account and project
- PostgreSQL database (via Supabase)

## Environment Setup

### 1. Database Configuration

Create a `.env` file in `/apps/web/` with the following variables:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Auth
BETTER_AUTH_SECRET=your_random_secret_key
BETTER_AUTH_URL=http://localhost:3001

# CORS
CORS_ORIGIN=http://localhost:3001
```

### 2. Supabase Storage Setup

1. Go to your Supabase project dashboard
2. Navigate to Storage
3. Create a new public bucket named `accounting-files`
4. Set bucket to public or configure appropriate RLS policies

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Database Migration

```bash
pnpm db:push
```

This will create all necessary tables in your PostgreSQL database.

### 5. Run Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3001`

## Default User Setup

After first signup, you'll need to manually set the first user as admin:

1. Connect to your database
2. Run: 
```sql
UPDATE "user" SET role = 'admin' WHERE email = 'your_email@example.com';
```

## Features Implemented

✅ Authentication with Better Auth
✅ User role management (Admin, Finance, Viewer)
✅ Receipts Management (CRUD)
✅ Invoices Management (CRUD)
✅ Expenses Management (CRUD)
✅ Categories Management (CRUD)
✅ Reports & Analytics Dashboard
✅ Role-Based Access Control
✅ File Upload Integration (Supabase Storage)
✅ Responsive UI with Tailwind CSS
✅ Type-safe API with tRPC
✅ Database ORM with Drizzle

## Folder Structure

```
/apps/web           - Next.js frontend application
/packages/api       - tRPC API routers and logic
/packages/auth      - Better Auth configuration
/packages/db        - Drizzle schema and database connection
```

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm db:push` | Push schema changes to database |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:studio` | Open Drizzle Studio |

## Role Permissions

### Admin
- Full access to all features
- User management
- Create, read, update, delete all records

### Finance
- Create, read, update receipts, invoices, expenses
- Cannot delete records
- Cannot manage users

### Viewer
- Read-only access to all financial data
- Cannot create, update, or delete records

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS
- **Backend**: tRPC, Better Auth
- **Database**: PostgreSQL (Supabase), Drizzle ORM
- **Storage**: Supabase Storage
- **UI Components**: Radix UI, shadcn/ui
- **Monorepo**: Turborepo + pnpm workspaces


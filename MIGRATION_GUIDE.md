# Database Migration Guide

## Overview

This guide will help you migrate your database schema to include all the new accounting features.

## Prerequisites

- Access to your PostgreSQL database
- Database connection string
- Admin access to your Supabase project

## Migration Steps

### Step 1: Update User Table

The user table needs to include a role column:

```sql
-- Add role column to user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'viewer';
ALTER TABLE "user" ADD CONSTRAINT "user_role_check" CHECK (role IN ('admin', 'finance', 'viewer'));
```

### Step 2: Create New Tables

Run the following SQL to create all necessary tables:

```sql
-- Create receipts table
CREATE TABLE IF NOT EXISTS "receipts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "amount" DECIMAL(10, 2) NOT NULL,
    "date" TIMESTAMP NOT NULL,
    "category" TEXT NOT NULL,
    "payment_method" TEXT,
    "description" TEXT,
    "file_url" TEXT,
    "created_by_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS "invoices" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "client_name" TEXT NOT NULL,
    "client_email" TEXT,
    "client_address" TEXT,
    "service" TEXT NOT NULL,
    "total_amount" DECIMAL(10, 2) NOT NULL,
    "due_date" TIMESTAMP NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_by_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "invoices_status_check" CHECK (status IN ('paid', 'unpaid', 'pending', 'overdue'))
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS "expenses" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "amount" DECIMAL(10, 2) NOT NULL,
    "department" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "date" TIMESTAMP NOT NULL,
    "description" TEXT,
    "vendor" TEXT,
    "payment_method" TEXT,
    "receipt_url" TEXT,
    "created_by_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS "categories" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL UNIQUE,
    "type" TEXT NOT NULL DEFAULT 'both',
    "description" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "categories_type_check" CHECK (type IN ('receipt', 'expense', 'both'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "receipts_created_by_id_idx" ON "receipts"("created_by_id");
CREATE INDEX IF NOT EXISTS "receipts_date_idx" ON "receipts"("date");
CREATE INDEX IF NOT EXISTS "receipts_category_idx" ON "receipts"("category");

CREATE INDEX IF NOT EXISTS "invoices_created_by_id_idx" ON "invoices"("created_by_id");
CREATE INDEX IF NOT EXISTS "invoices_due_date_idx" ON "invoices"("due_date");
CREATE INDEX IF NOT EXISTS "invoices_status_idx" ON "invoices"("status");

CREATE INDEX IF NOT EXISTS "expenses_created_by_id_idx" ON "expenses"("created_by_id");
CREATE INDEX IF NOT EXISTS "expenses_date_idx" ON "expenses"("date");
CREATE INDEX IF NOT EXISTS "expenses_department_idx" ON "expenses"("department");
CREATE INDEX IF NOT EXISTS "expenses_category_idx" ON "expenses"("category");
```

### Step 3: Seed Initial Data (Optional)

Insert some default categories:

```sql
INSERT INTO "categories" ("name", "type", "description") VALUES
    ('Office Supplies', 'both', 'Office supplies and equipment'),
    ('Travel', 'expense', 'Business travel expenses'),
    ('Meals & Entertainment', 'expense', 'Client meals and entertainment'),
    ('Software & Subscriptions', 'expense', 'Software licenses and subscriptions'),
    ('Marketing', 'expense', 'Marketing and advertising expenses'),
    ('Utilities', 'expense', 'Office utilities'),
    ('Client Payment', 'receipt', 'Payments received from clients'),
    ('Refund', 'receipt', 'Refunds received')
ON CONFLICT (name) DO NOTHING;
```

### Step 4: Set First Admin User

After creating your first user account, set them as admin:

```sql
UPDATE "user" 
SET "role" = 'admin' 
WHERE "email" = 'your_email@example.com';
```

### Step 5: Setup Supabase Storage

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `accounting-files`
3. Set bucket policies:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'accounting-files');

-- Allow authenticated users to read files
CREATE POLICY "Allow authenticated users to read files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'accounting-files');

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'accounting-files' AND auth.uid()::text = owner);
```

## Using Drizzle Kit (Recommended)

If you prefer using Drizzle Kit for migrations:

```bash
# Generate migration files
pnpm db:generate

# Push changes to database
pnpm db:push

# Or apply migrations
pnpm db:migrate
```

## Verification

After migration, verify the tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user', 'receipts', 'invoices', 'expenses', 'categories');
```

You should see all 5 tables listed.

## Rollback (If Needed)

To rollback changes:

```sql
-- Drop tables in reverse order (respecting foreign keys)
DROP TABLE IF EXISTS "receipts" CASCADE;
DROP TABLE IF EXISTS "invoices" CASCADE;
DROP TABLE IF EXISTS "expenses" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;

-- Remove role column from user table
ALTER TABLE "user" DROP COLUMN IF EXISTS "role";
```

## Troubleshooting

### Issue: Foreign key constraint error

**Solution**: Ensure the user table exists and has the correct structure before creating dependent tables.

### Issue: Permission denied

**Solution**: Make sure you're using a database user with sufficient privileges.

### Issue: Duplicate column error

**Solution**: Check if columns already exist before adding them:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user' AND column_name = 'role';
```

## Next Steps

After successful migration:

1. Install dependencies: `pnpm install`
2. Update environment variables
3. Test the application locally
4. Deploy to production

## Support

If you encounter issues during migration:
1. Check database logs
2. Verify connection string
3. Ensure all prerequisites are met
4. Contact system administrator


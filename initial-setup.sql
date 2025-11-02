-- ========================================
-- Initial Setup SQL for Supabase
-- ========================================
-- Run this in your Supabase SQL Editor after signing up

-- 1. Set your first user as admin
-- Replace 'your_email@example.com' with your actual email
UPDATE "user" 
SET role = 'admin' 
WHERE email = 'your_email@example.com';

-- 2. Insert default categories
INSERT INTO "categories" ("name", "type", "description") VALUES
    ('Office Supplies', 'both', 'Office supplies and equipment'),
    ('Travel', 'expense', 'Business travel expenses'),
    ('Meals & Entertainment', 'expense', 'Client meals and entertainment'),
    ('Software & Subscriptions', 'expense', 'Software licenses and subscriptions'),
    ('Marketing', 'expense', 'Marketing and advertising expenses'),
    ('Utilities', 'expense', 'Office utilities and bills'),
    ('Professional Services', 'expense', 'Consulting and professional fees'),
    ('Equipment', 'both', 'Equipment purchases and maintenance'),
    ('Client Payment', 'receipt', 'Payments received from clients'),
    ('Refund', 'receipt', 'Refunds and reimbursements received'),
    ('Grant', 'receipt', 'Grant funding received'),
    ('Investment', 'receipt', 'Investment income')
ON CONFLICT (name) DO NOTHING;

-- 3. Verify setup
SELECT 
    (SELECT COUNT(*) FROM "user" WHERE role = 'admin') as admin_users,
    (SELECT COUNT(*) FROM "categories") as total_categories,
    (SELECT COUNT(*) FROM "receipts") as total_receipts,
    (SELECT COUNT(*) FROM "invoices") as total_invoices,
    (SELECT COUNT(*) FROM "expenses") as total_expenses;

-- 4. View your admin user
SELECT id, name, email, role, "createdAt" 
FROM "user" 
WHERE role = 'admin';

-- ========================================
-- Storage Bucket Policies (if needed)
-- ========================================
-- Run these if you want to secure your storage bucket

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

-- Allow users to update their own files
CREATE POLICY "Allow users to update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'accounting-files');

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'accounting-files');

-- ========================================
-- Useful Queries for Management
-- ========================================

-- View all users with their roles
-- SELECT id, name, email, role, "emailVerified", "createdAt" FROM "user" ORDER BY "createdAt" DESC;

-- View recent receipts
-- SELECT id, title, amount, category, date, "createdAt" FROM "receipts" ORDER BY date DESC LIMIT 10;

-- View recent invoices
-- SELECT id, "clientName", "totalAmount", status, "dueDate", "createdAt" FROM "invoices" ORDER BY "dueDate" DESC LIMIT 10;

-- View recent expenses
-- SELECT id, title, amount, department, category, date FROM "expenses" ORDER BY date DESC LIMIT 10;

-- Summary statistics
-- SELECT 
--     (SELECT COUNT(*) FROM "receipts") as total_receipts,
--     (SELECT SUM(amount::numeric) FROM "receipts") as receipts_sum,
--     (SELECT COUNT(*) FROM "invoices") as total_invoices,
--     (SELECT SUM("totalAmount"::numeric) FROM "invoices") as invoices_sum,
--     (SELECT COUNT(*) FROM "expenses") as total_expenses,
--     (SELECT SUM(amount::numeric) FROM "expenses") as expenses_sum;


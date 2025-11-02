# Quick Start Guide

## Step 1: Create Environment File

Create a file named `.env` in the `apps/web/` directory with the following content:

```env
# Database - Connect to Supabase via connection pooling
DATABASE_URL="postgresql://postgres.wdxcdbogewwvbsiwcnzq:uSCPtiDgh35flYY0@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection to the database. Used for migrations
DIRECT_URL="postgresql://postgres.wdxcdbogewwvbsiwcnzq:uSCPtiDgh35flYY0@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://wdxcdbogewwvbsiwcnzq.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY_HERE"

# Auth Configuration (generate a random 32+ character string)
BETTER_AUTH_SECRET="change-this-to-a-random-32-character-secret"
BETTER_AUTH_URL="http://localhost:3001"

# CORS
CORS_ORIGIN="http://localhost:3001"
```

## Step 2: Get Your Supabase Anon Key

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project (wdxcdbogewwvbsiwcnzq)
3. Go to Settings → API
4. Copy the `anon` `public` key
5. Replace `YOUR_ANON_KEY_HERE` in the .env file

## Step 3: Generate Auth Secret

Run this command to generate a secure random secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Replace `change-this-to-a-random-32-character-secret` with the generated value.

## Step 4: Install Dependencies

```bash
pnpm install
```

## Step 5: Push Database Schema

```bash
pnpm db:push
```

This will create all the tables in your Supabase database.

## Step 6: Setup Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `accounting-files`
3. Make it public or set appropriate policies

## Step 7: Start Development Server

```bash
pnpm dev
```

Visit: http://localhost:3001

## Step 8: Create First Admin User

1. Sign up with your email
2. Connect to your database and run:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'your_email@example.com';
```

You're all set! 🎉


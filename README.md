# 🧾 Internal Accounting Application

A comprehensive, full-stack internal accounting system built with modern web technologies. This application helps companies manage receipts, invoices, expenses, and generate detailed financial reports.

## ✨ Features

### 🔐 Authentication & Authorization
- Secure authentication with Better Auth
- Role-based access control (Admin, Finance, Viewer)
- Email/password authentication
- Session management

### 📊 Core Features

#### 1. **Receipts Management**
- Create, read, update, and delete receipts
- Upload receipt images/PDFs
- Categorize receipts
- Track payment methods
- Advanced search and filtering

#### 2. **Invoices Management**
- Complete invoice lifecycle management
- Multiple invoice statuses (Paid, Unpaid, Pending, Overdue)
- Client information tracking
- Service details and amounts
- Status updates

#### 3. **Expenses Tracking**
- Department-based expense tracking
- Category management
- Vendor information
- Payment method tracking
- File attachments for receipts

#### 4. **Reports & Analytics**
- Real-time financial summaries
- Income vs Expenses analysis
- Monthly breakdown charts
- Department and category analytics
- Invoice status overview
- Date range filtering

#### 5. **Categories Management**
- Custom category creation
- Type-specific categories (Receipt, Expense, Both)
- Category descriptions

#### 6. **User Management** (Admin Only)
- User role management
- Permission overview
- User activity tracking

### 🔒 Role Permissions

| Feature | Admin | Finance | Viewer |
|---------|-------|---------|--------|
| View Data | ✅ | ✅ | ✅ |
| Create Records | ✅ | ✅ | ❌ |
| Update Records | ✅ | ✅ | ❌ |
| Delete Records | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| Manage Categories | ✅ | ❌ | ❌ |

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Re-usable component library
- **Lucide React** - Icon library

### Backend
- **tRPC** - End-to-end typesafe APIs
- **Better Auth** - Authentication solution
- **Drizzle ORM** - TypeScript ORM
- **PostgreSQL** - Database (via Supabase)

### Storage & Hosting
- **Supabase** - Database hosting and file storage
- **Vercel** - Deployment platform (recommended)

### Development Tools
- **Turborepo** - Monorepo build system
- **pnpm** - Fast, disk space efficient package manager
- **TypeScript** - Type safety
- **ESLint** - Code linting

## 📁 Project Structure

```
sepupus-account/
├── apps/
│   └── web/                    # Next.js frontend application
│       ├── src/
│       │   ├── app/           # App router pages
│       │   │   ├── dashboard/ # Dashboard pages
│       │   │   │   ├── receipts/
│       │   │   │   ├── invoices/
│       │   │   │   ├── expenses/
│       │   │   │   ├── reports/
│       │   │   │   ├── categories/
│       │   │   │   └── users/
│       │   │   ├── login/     # Authentication pages
│       │   │   └── api/       # API routes
│       │   ├── components/    # React components
│       │   │   ├── ui/        # shadcn/ui components
│       │   │   ├── sidebar.tsx
│       │   │   ├── header.tsx
│       │   │   └── file-upload.tsx
│       │   ├── lib/           # Utilities
│       │   │   ├── auth-client.ts
│       │   │   ├── supabase-client.ts
│       │   │   ├── rbac.ts
│       │   │   └── utils.ts
│       │   └── utils/
│       │       └── trpc.ts    # tRPC client setup
│       └── package.json
│
├── packages/
│   ├── api/                   # tRPC API layer
│   │   └── src/
│   │       ├── routers/
│   │       │   ├── receipts.ts
│   │       │   ├── invoices.ts
│   │       │   ├── expenses.ts
│   │       │   ├── categories.ts
│   │       │   ├── reports.ts
│   │       │   ├── users.ts
│   │       │   └── index.ts
│   │       ├── context.ts
│   │       └── index.ts
│   │
│   ├── auth/                  # Better Auth configuration
│   │   └── src/
│   │       └── index.ts
│   │
│   └── db/                    # Database layer
│       └── src/
│           ├── schema/
│           │   ├── auth.ts
│           │   ├── receipts.ts
│           │   ├── invoices.ts
│           │   ├── expenses.ts
│           │   ├── categories.ts
│           │   └── index.ts
│           └── index.ts
│
├── instruction.md             # Original requirements
├── SETUP.md                  # Setup instructions
├── README.md                 # This file
├── turbo.json               # Turborepo configuration
└── package.json             # Root package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Supabase account and project
- PostgreSQL database (via Supabase)

### Installation

1. **Clone the repository**
   ```bash
   cd sepupus-account
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   
   Create `.env` file in `/apps/web/`:
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

4. **Supabase Storage Setup**
   - Navigate to your Supabase project dashboard
   - Go to Storage section
   - Create a new public bucket named `accounting-files`
   - Configure appropriate permissions

5. **Database Migration**
   ```bash
   pnpm db:push
   ```

6. **Run Development Server**
   ```bash
   pnpm dev
   ```

7. **Access the Application**
   
   Open [http://localhost:3001](http://localhost:3001)

### First-Time Setup

After signing up your first user, manually set them as admin:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'your_email@example.com';
```

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all development servers |
| `pnpm build` | Build all packages for production |
| `pnpm dev:web` | Start only web application |
| `pnpm db:push` | Push schema changes to database |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:studio` | Open Drizzle Studio (database GUI) |
| `pnpm check-types` | Type check all packages |

## 🎯 Usage Guide

### For Administrators

1. **User Management**: Navigate to Users page to assign roles
2. **Category Setup**: Create expense and receipt categories
3. **Full CRUD Access**: Manage all financial records

### For Finance Team

1. **Record Management**: Create and update receipts, invoices, expenses
2. **File Uploads**: Attach supporting documents
3. **Reports Access**: View all financial reports

### For Viewers

1. **Read-Only Access**: View all financial data
2. **Reports**: Access reports and analytics
3. **Export Data**: View and export financial information

## 🔧 API Documentation

The application uses tRPC for type-safe API calls. Main routers include:

- **receipts**: CRUD operations for receipts
- **invoices**: CRUD operations for invoices
- **expenses**: CRUD operations for expenses
- **categories**: Category management
- **reports**: Financial reports and analytics
- **users**: User management (admin only)

## 🎨 UI Components

Built with shadcn/ui components:
- Forms (Input, Select, Dialog)
- Data Display (Table, Card, Badge)
- Navigation (Sidebar, Header)
- Feedback (Toast notifications)

## 🔐 Security Features

- Server-side session management
- Role-based access control
- Protected API routes
- Secure file uploads
- Input validation with Zod

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Ensure the following:
- Node.js 18+ environment
- Environment variables configured
- Database accessible
- Build command: `pnpm build`
- Start command: `pnpm start`

## 📊 Database Schema

### Core Tables
- `user` - User accounts and roles
- `receipts` - Receipt records
- `invoices` - Invoice records
- `expenses` - Expense records
- `categories` - Category definitions
- `session` - User sessions
- `account` - Authentication accounts

## 🤝 Contributing

This is an internal company application. For changes:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit pull request
5. Get approval from admin

## 📄 License

Internal proprietary software. Not for external distribution.

## 🆘 Support

For issues or questions:
- Check `SETUP.md` for setup instructions
- Review `instruction.md` for requirements
- Contact system administrator

## 🎉 Acknowledgments

Built with modern technologies:
- Next.js team for the amazing framework
- tRPC for type-safe APIs
- Drizzle team for excellent ORM
- shadcn for beautiful UI components
- Supabase for backend infrastructure

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Status**: Production Ready ✅

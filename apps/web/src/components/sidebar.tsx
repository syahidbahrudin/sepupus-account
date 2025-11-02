"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import {
  LayoutDashboard,
  Receipt,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  FolderKanban,
  Package,
  Warehouse,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Receipts",
    href: "/dashboard/receipts",
    icon: Receipt,
  },
  {
    title: "Invoices",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    title: "Expenses",
    href: "/dashboard/expenses",
    icon: CreditCard,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Inventory",
    href: "/dashboard/inventory",
    icon: Warehouse,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: TrendingUp,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Chatbot",
    href: "/dashboard/chatbot",
    icon: MessageSquare,
  },
  {
    title: "Categories",
    href: "/dashboard/categories",
    icon: FolderKanban,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Settings,
    adminOnly: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: currentUser } = trpc.users.getCurrentUser.useQuery();

  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="pb-12 w-64 border-r min-h-screen">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Accounting System</h2>
          <div className="space-y-1">
            {menuItems.map((item) => {
              // Hide admin-only items from non-admins
              if ("adminOnly" in item && item.adminOnly && !isAdmin) {
                return null;
              }

              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

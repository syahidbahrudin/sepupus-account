"use client";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DollarSign,
  Receipt,
  FileText,
  TrendingUp,
  CreditCard,
  BarChart3,
} from "lucide-react";

export default function Dashboard({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  const { data: summary } = trpc.reports.getSummary.useQuery({});

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  const QuickActionCard = ({
    title,
    description,
    icon: Icon,
    href,
    color,
  }: {
    title: string;
    description: string;
    icon: any;
    href: string;
    color: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div
          className={`p-2 w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-2`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Link href={href as any}>
          <Button variant="outline" className="w-full">
            Go to {title}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, {session.user.name}!
        </h2>
        <p className="text-muted-foreground">
          Here's an overview of your accounting system
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.totalIncome || "0")}
            </div>
            <p className="text-xs text-muted-foreground">From invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.totalExpenses || "0")}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.expenseCount || 0} expenses recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.netIncome || "0")}
            </div>
            <p className="text-xs text-muted-foreground">Income - Expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Receipts
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.totalReceipts || "0")}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.receiptCount || 0} receipts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickActionCard
            title="Receipts"
            description="Manage and track all your receipts"
            icon={Receipt}
            href="/dashboard/receipts"
            color="bg-blue-500"
          />
          <QuickActionCard
            title="Invoices"
            description="Create and manage client invoices"
            icon={FileText}
            href="/dashboard/invoices"
            color="bg-green-500"
          />
          <QuickActionCard
            title="Expenses"
            description="Track company expenses by department"
            icon={CreditCard}
            href="/dashboard/expenses"
            color="bg-purple-500"
          />
          <QuickActionCard
            title="Reports"
            description="View detailed analytics and reports"
            icon={BarChart3}
            href="/dashboard/reports"
            color="bg-orange-500"
          />
        </div>
      </div>

      {/* Invoice Status Overview */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Paid</div>
                <div className="text-2xl font-bold text-green-600">
                  {summary.invoiceStats.paid}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Unpaid</div>
                <div className="text-2xl font-bold text-red-600">
                  {summary.invoiceStats.unpaid}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {summary.invoiceStats.pending}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

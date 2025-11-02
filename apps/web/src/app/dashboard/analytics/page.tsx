"use client";

import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react";

export default function AnalyticsPage() {
	// Fetch analytics data
	const { data: shortMoney } = trpc.analytics.getShortMoney.useQuery({});
	const { data: dailyIncome } = trpc.analytics.getDailyIncome.useQuery({});
	const { data: monthlyIncome } = trpc.analytics.getMonthlyIncome.useQuery({ months: 12 });
	const { data: yearlyIncome } = trpc.analytics.getYearlyIncome.useQuery({ years: 5 });
	const { data: fixedAssets } = trpc.analytics.getTotalFixedAssets.useQuery();

	const formatCurrency = (amount: string) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(parseFloat(amount || "0"));
	};

	const formatMonthYear = (month: number, year: number) => {
		const date = new Date(year, month - 1);
		return date.toLocaleString("default", { month: "short", year: "numeric" });
	};

	const dailyNet = parseFloat(dailyIncome?.net || "0");
	const isDailyPositive = dailyNet >= 0;

	return (
		<div className="container mx-auto py-10">
			<h1 className="text-4xl font-bold mb-8">Analytics Dashboard</h1>

			{/* Short Money Tracker */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Short Money</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(shortMoney?.shortMoney || "0")}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Income: {formatCurrency(shortMoney?.totalIncome || "0")} | Expenses:{" "}
							{formatCurrency(shortMoney?.totalExpenses || "0")}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Today's Net</CardTitle>
						{isDailyPositive ? (
							<TrendingUp className="h-4 w-4 text-green-500" />
						) : (
							<TrendingDown className="h-4 w-4 text-red-500" />
						)}
					</CardHeader>
					<CardContent>
						<div
							className={`text-2xl font-bold ${isDailyPositive ? "text-green-600" : "text-red-600"}`}
						>
							{formatCurrency(dailyIncome?.net || "0")}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							Income: {formatCurrency(dailyIncome?.income || "0")} | Expenses:{" "}
							{formatCurrency(dailyIncome?.expenses || "0")}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Fixed Assets</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(fixedAssets?.totalValue || "0")}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{fixedAssets?.count || 0} items
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Daily Income Chart */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Daily Income & Expenses</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={dailyIncome ? [dailyIncome] : []}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="date" />
							<YAxis />
							<Tooltip formatter={(value) => formatCurrency(value as string)} />
							<Legend />
							<Line
								type="monotone"
								dataKey="income"
								stroke="#22c55e"
								name="Income"
								strokeWidth={2}
							/>
							<Line
								type="monotone"
								dataKey="expenses"
								stroke="#ef4444"
								name="Expenses"
								strokeWidth={2}
							/>
							<Line
								type="monotone"
								dataKey="net"
								stroke="#3b82f6"
								name="Net"
								strokeWidth={2}
							/>
						</LineChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			{/* Monthly Income Chart */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Monthly Income & Expenses (Last 12 Months)</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={400}>
						<BarChart data={monthlyIncome || []}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								dataKey="monthName"
								tickFormatter={(value, index) => {
									const item = monthlyIncome?.[index];
									return item ? formatMonthYear(item.month, item.year) : value;
								}}
							/>
							<YAxis />
							<Tooltip formatter={(value) => formatCurrency(value as string)} />
							<Legend />
							<Bar dataKey="income" fill="#22c55e" name="Income" />
							<Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
							<Bar dataKey="net" fill="#3b82f6" name="Net" />
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			{/* Yearly Income Chart */}
			<Card>
				<CardHeader>
					<CardTitle>Yearly Income Trend (Last 5 Years)</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={400}>
						<LineChart data={yearlyIncome || []}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="year" />
							<YAxis />
							<YAxis />
							<Tooltip formatter={(value) => formatCurrency(value as string)} />
							<Legend />
							<Line
								type="monotone"
								dataKey="income"
								stroke="#22c55e"
								name="Income"
								strokeWidth={2}
							/>
							<Line
								type="monotone"
								dataKey="expenses"
								stroke="#ef4444"
								name="Expenses"
								strokeWidth={2}
							/>
							<Line
								type="monotone"
								dataKey="net"
								stroke="#3b82f6"
								name="Net"
								strokeWidth={2}
							/>
						</LineChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
		</div>
	);
}


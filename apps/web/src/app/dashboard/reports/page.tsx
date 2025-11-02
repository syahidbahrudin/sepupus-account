"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	DollarSign,
	TrendingUp,
	TrendingDown,
	Receipt,
	FileText,
	CreditCard,
} from "lucide-react";

export default function ReportsPage() {
	const currentYear = new Date().getFullYear();
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [selectedYear, setSelectedYear] = useState(currentYear);

	// Fetch summary
	const { data: summary, isLoading: summaryLoading } = trpc.reports.getSummary.useQuery({
		startDate: startDate || undefined,
		endDate: endDate || undefined,
	});

	// Fetch expenses by category
	const { data: expensesByCategory } = trpc.reports.getExpensesByCategory.useQuery({
		startDate: startDate || undefined,
		endDate: endDate || undefined,
	});

	// Fetch expenses by department
	const { data: expensesByDepartment } = trpc.reports.getExpensesByDepartment.useQuery({
		startDate: startDate || undefined,
		endDate: endDate || undefined,
	});

	// Fetch monthly breakdown
	const { data: monthlyData } = trpc.reports.getMonthlyBreakdown.useQuery({
		year: selectedYear,
	});

	const formatCurrency = (amount: string | number) => {
		const num = typeof amount === "string" ? parseFloat(amount) : amount;
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(num);
	};

	const StatCard = ({
		title,
		value,
		icon: Icon,
		trend,
	}: {
		title: string;
		value: string;
		icon: any;
		trend?: "up" | "down";
	}) => (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{value}</div>
				{trend && (
					<p className="text-xs text-muted-foreground flex items-center mt-1">
						{trend === "up" ? (
							<TrendingUp className="h-3 w-3 mr-1 text-green-500" />
						) : (
							<TrendingDown className="h-3 w-3 mr-1 text-red-500" />
						)}
					</p>
				)}
			</CardContent>
		</Card>
	);

	if (summaryLoading) {
		return (
			<div className="container mx-auto py-10">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-10">
			<h1 className="text-4xl font-bold mb-8">Reports & Analytics</h1>

			{/* Date Filters */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Date Range Filter</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex gap-4 items-end">
						<div className="space-y-2">
							<Label htmlFor="startDate">Start Date</Label>
							<Input
								id="startDate"
								type="date"
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="endDate">End Date</Label>
							<Input
								id="endDate"
								type="date"
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
							/>
						</div>
						<Button
							onClick={() => {
								setStartDate("");
								setEndDate("");
							}}
							variant="outline"
						>
							Clear Filters
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Summary Statistics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
				<StatCard
					title="Total Income"
					value={formatCurrency(summary?.totalIncome || "0")}
					icon={DollarSign}
					trend="up"
				/>
				<StatCard
					title="Total Expenses"
					value={formatCurrency(summary?.totalExpenses || "0")}
					icon={TrendingDown}
					trend="down"
				/>
				<StatCard
					title="Net Income"
					value={formatCurrency(summary?.netIncome || "0")}
					icon={TrendingUp}
				/>
				<StatCard
					title="Total Receipts"
					value={formatCurrency(summary?.totalReceipts || "0")}
					icon={Receipt}
				/>
			</div>

			{/* Invoice Stats */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Invoice Statistics</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3">
						<div className="space-y-2">
							<div className="text-sm text-muted-foreground">Paid Invoices</div>
							<div className="text-2xl font-bold text-green-600">
								{summary?.invoiceStats.paid || 0}
							</div>
						</div>
						<div className="space-y-2">
							<div className="text-sm text-muted-foreground">Unpaid Invoices</div>
							<div className="text-2xl font-bold text-red-600">
								{summary?.invoiceStats.unpaid || 0}
							</div>
						</div>
						<div className="space-y-2">
							<div className="text-sm text-muted-foreground">Pending Invoices</div>
							<div className="text-2xl font-bold text-yellow-600">
								{summary?.invoiceStats.pending || 0}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-6 md:grid-cols-2 mb-6">
				{/* Expenses by Category */}
				<Card>
					<CardHeader>
						<CardTitle>Expenses by Category</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{expensesByCategory && expensesByCategory.length > 0 ? (
								expensesByCategory.map((item, index) => (
									<div key={index} className="flex items-center justify-between">
										<div className="space-y-1">
											<p className="font-medium">{item.category}</p>
											<p className="text-sm text-muted-foreground">
												{item.count} {item.count === 1 ? "expense" : "expenses"}
											</p>
										</div>
										<div className="text-right">
											<p className="font-bold">{formatCurrency(item.total)}</p>
										</div>
									</div>
								))
							) : (
								<p className="text-center text-muted-foreground py-4">
									No expense data available
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Expenses by Department */}
				<Card>
					<CardHeader>
						<CardTitle>Expenses by Department</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{expensesByDepartment && expensesByDepartment.length > 0 ? (
								expensesByDepartment.map((item, index) => (
									<div key={index} className="flex items-center justify-between">
										<div className="space-y-1">
											<p className="font-medium">{item.department}</p>
											<p className="text-sm text-muted-foreground">
												{item.count} {item.count === 1 ? "expense" : "expenses"}
											</p>
										</div>
										<div className="text-right">
											<p className="font-bold">{formatCurrency(item.total)}</p>
										</div>
									</div>
								))
							) : (
								<p className="text-center text-muted-foreground py-4">
									No department data available
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Monthly Breakdown */}
			<Card>
				<CardHeader>
					<div className="flex justify-between items-center">
						<CardTitle>Monthly Breakdown - {selectedYear}</CardTitle>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setSelectedYear(selectedYear - 1)}
							>
								Previous Year
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setSelectedYear(selectedYear + 1)}
								disabled={selectedYear >= currentYear}
							>
								Next Year
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{monthlyData &&
							monthlyData.map((month) => {
								const monthName = new Date(2024, month.month - 1).toLocaleString(
									"default",
									{ month: "long" }
								);
								return (
									<div
										key={month.month}
										className="flex items-center justify-between border-b pb-3"
									>
										<div className="flex-1">
											<p className="font-medium">{monthName}</p>
										</div>
										<div className="flex gap-8 text-right">
											<div>
												<p className="text-sm text-muted-foreground">Income</p>
												<p className="font-bold text-green-600">
													{formatCurrency(month.income)}
												</p>
											</div>
											<div>
												<p className="text-sm text-muted-foreground">Expenses</p>
												<p className="font-bold text-red-600">
													{formatCurrency(month.expenses)}
												</p>
											</div>
											<div>
												<p className="text-sm text-muted-foreground">Net</p>
												<p
													className={`font-bold ${
														parseFloat(month.net) >= 0
															? "text-green-600"
															: "text-red-600"
													}`}
												>
													{formatCurrency(month.net)}
												</p>
											</div>
										</div>
									</div>
								);
							})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}


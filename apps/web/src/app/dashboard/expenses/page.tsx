"use client";

import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PlusCircle, Pencil, Trash2, Search } from "lucide-react";

export default function ExpensesPage() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingExpense, setEditingExpense] = useState<any>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [departmentFilter, setDepartmentFilter] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");

	const utils = trpc.useUtils();

	// Fetch expenses
	const { data: expenses, isLoading } = trpc.expenses.getAll.useQuery({
		search: searchTerm,
		department: departmentFilter || undefined,
		category: categoryFilter || undefined,
	});

	// Create mutation
	const createMutation = trpc.expenses.create.useMutation({
		onSuccess: () => {
			toast.success("Expense created successfully");
			utils.expenses.getAll.invalidate();
			setDialogOpen(false);
		},
		onError: (error) => {
			toast.error("Failed to create expense: " + error.message);
		},
	});

	// Update mutation
	const updateMutation = trpc.expenses.update.useMutation({
		onSuccess: () => {
			toast.success("Expense updated successfully");
			utils.expenses.getAll.invalidate();
			setDialogOpen(false);
			setEditingExpense(null);
		},
		onError: (error) => {
			toast.error("Failed to update expense: " + error.message);
		},
	});

	// Delete mutation
	const deleteMutation = trpc.expenses.delete.useMutation({
		onSuccess: () => {
			toast.success("Expense deleted successfully");
			utils.expenses.getAll.invalidate();
		},
		onError: (error) => {
			toast.error("Failed to delete expense: " + error.message);
		},
	});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const data = {
			title: formData.get("title") as string,
			amount: formData.get("amount") as string,
			department: formData.get("department") as string,
			category: formData.get("category") as string,
			date: formData.get("date") as string,
			description: formData.get("description") as string,
			vendor: formData.get("vendor") as string,
			paymentMethod: formData.get("paymentMethod") as string,
		};

		if (editingExpense) {
			updateMutation.mutate({ id: editingExpense.id, ...data });
		} else {
			createMutation.mutate(data);
		}
	};

	const handleEdit = (expense: any) => {
		setEditingExpense(expense);
		setDialogOpen(true);
	};

	const handleDelete = (id: string) => {
		if (confirm("Are you sure you want to delete this expense?")) {
			deleteMutation.mutate({ id });
		}
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		setEditingExpense(null);
	};

	return (
		<div className="container mx-auto py-10">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-4xl font-bold">Expenses Management</h1>
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogTrigger asChild>
						<Button onClick={() => setEditingExpense(null)}>
							<PlusCircle className="mr-2 h-4 w-4" />
							Add Expense
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>
								{editingExpense ? "Edit Expense" : "Create New Expense"}
							</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="title">Title</Label>
								<Input
									id="title"
									name="title"
									defaultValue={editingExpense?.title}
									required
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="amount">Amount</Label>
									<Input
										id="amount"
										name="amount"
										type="number"
										step="0.01"
										defaultValue={editingExpense?.amount}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="date">Date</Label>
									<Input
										id="date"
										name="date"
										type="date"
										defaultValue={
											editingExpense?.date
												? new Date(editingExpense.date).toISOString().split("T")[0]
												: new Date().toISOString().split("T")[0]
										}
										required
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="department">Department</Label>
									<Input
										id="department"
										name="department"
										defaultValue={editingExpense?.department}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="category">Category</Label>
									<Input
										id="category"
										name="category"
										defaultValue={editingExpense?.category}
										required
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="vendor">Vendor</Label>
									<Input
										id="vendor"
										name="vendor"
										defaultValue={editingExpense?.vendor}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="paymentMethod">Payment Method</Label>
									<Input
										id="paymentMethod"
										name="paymentMethod"
										defaultValue={editingExpense?.paymentMethod}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Input
									id="description"
									name="description"
									defaultValue={editingExpense?.description}
								/>
							</div>
							<div className="flex justify-end gap-2">
								<Button type="button" variant="outline" onClick={handleCloseDialog}>
									Cancel
								</Button>
								<Button type="submit">
									{editingExpense ? "Update" : "Create"}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Filters</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex gap-4">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search expenses..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-8"
								/>
							</div>
						</div>
						<Input
							placeholder="Filter by department..."
							value={departmentFilter}
							onChange={(e) => setDepartmentFilter(e.target.value)}
							className="w-64"
						/>
						<Input
							placeholder="Filter by category..."
							value={categoryFilter}
							onChange={(e) => setCategoryFilter(e.target.value)}
							className="w-64"
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="pt-6">
					{isLoading ? (
						<div className="text-center py-10">Loading...</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Title</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Department</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Vendor</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{expenses && expenses.length > 0 ? (
									expenses.map((expense) => (
										<TableRow key={expense.id}>
											<TableCell>{expense.title}</TableCell>
											<TableCell>${expense.amount}</TableCell>
											<TableCell>{expense.department}</TableCell>
											<TableCell>{expense.category}</TableCell>
											<TableCell>
												{new Date(expense.date).toLocaleDateString()}
											</TableCell>
											<TableCell>{expense.vendor || "N/A"}</TableCell>
											<TableCell className="text-right">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleEdit(expense)}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDelete(expense.id)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={7} className="text-center py-10">
											No expenses found. Create your first expense!
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}


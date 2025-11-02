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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PlusCircle, Pencil, Trash2, Search } from "lucide-react";

export default function ReceiptsPage() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingReceipt, setEditingReceipt] = useState<any>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");
	const [receiptType, setReceiptType] = useState<"income" | "expense">("expense");
	const [receiptItems, setReceiptItems] = useState<Array<{ productId: string; quantity: number }>>([]);

	const utils = trpc.useUtils();

	// Fetch receipts
	const { data: receipts, isLoading } = trpc.receipts.getAll.useQuery({
		search: searchTerm,
		category: categoryFilter || undefined,
	});

	// Fetch products for items
	const { data: products } = trpc.products.getAll.useQuery({});

	// Create mutation
	const createMutation = trpc.receipts.create.useMutation({
		onSuccess: () => {
			toast.success("Receipt created successfully");
			utils.receipts.getAll.invalidate();
			setDialogOpen(false);
		},
		onError: (error) => {
			toast.error("Failed to create receipt: " + error.message);
		},
	});

	// Update mutation
	const updateMutation = trpc.receipts.update.useMutation({
		onSuccess: () => {
			toast.success("Receipt updated successfully");
			utils.receipts.getAll.invalidate();
			setDialogOpen(false);
			setEditingReceipt(null);
		},
		onError: (error) => {
			toast.error("Failed to update receipt: " + error.message);
		},
	});

	// Delete mutation
	const deleteMutation = trpc.receipts.delete.useMutation({
		onSuccess: () => {
			toast.success("Receipt deleted successfully");
			utils.receipts.getAll.invalidate();
		},
		onError: (error) => {
			toast.error("Failed to delete receipt: " + error.message);
		},
	});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const data = {
			title: formData.get("title") as string,
			amount: formData.get("amount") as string,
			date: formData.get("date") as string,
			category: formData.get("category") as string,
			type: receiptType,
			items: receiptType === "income" && receiptItems.length > 0 ? receiptItems : undefined,
			paymentMethod: formData.get("paymentMethod") as string,
			description: formData.get("description") as string,
		};

		if (editingReceipt) {
			updateMutation.mutate({ id: editingReceipt.id, ...data });
		} else {
			createMutation.mutate(data);
		}
	};

	const addItem = () => {
		setReceiptItems([...receiptItems, { productId: "", quantity: 1 }]);
	};

	const updateItem = (index: number, field: "productId" | "quantity", value: string | number) => {
		const updated = [...receiptItems];
		updated[index] = { ...updated[index], [field]: value };
		setReceiptItems(updated);
	};

	const removeItem = (index: number) => {
		setReceiptItems(receiptItems.filter((_, i) => i !== index));
	};

	const handleEdit = (receipt: any) => {
		setEditingReceipt(receipt);
		setReceiptType(receipt.type || "expense");
		if (receipt.items) {
			try {
				const parsedItems = typeof receipt.items === "string" 
					? JSON.parse(receipt.items) 
					: receipt.items;
				setReceiptItems(parsedItems || []);
			} catch {
				setReceiptItems([]);
			}
		} else {
			setReceiptItems([]);
		}
		setDialogOpen(true);
	};

	const handleDelete = (id: string) => {
		if (confirm("Are you sure you want to delete this receipt?")) {
			deleteMutation.mutate({ id });
		}
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		setEditingReceipt(null);
		setReceiptType("expense");
		setReceiptItems([]);
	};

	return (
		<div className="container mx-auto py-10">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-4xl font-bold">Receipts Management</h1>
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogTrigger asChild>
						<Button onClick={() => setEditingReceipt(null)}>
							<PlusCircle className="mr-2 h-4 w-4" />
							Add Receipt
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>
								{editingReceipt ? "Edit Receipt" : "Create New Receipt"}
							</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="title">Title</Label>
									<Input
										id="title"
										name="title"
										defaultValue={editingReceipt?.title}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="amount">Amount</Label>
									<Input
										id="amount"
										name="amount"
										type="number"
										step="0.01"
										defaultValue={editingReceipt?.amount}
										required
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="date">Date</Label>
									<Input
										id="date"
										name="date"
										type="date"
										defaultValue={
											editingReceipt?.date
												? new Date(editingReceipt.date).toISOString().split("T")[0]
												: new Date().toISOString().split("T")[0]
										}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="category">Category</Label>
									<Input
										id="category"
										name="category"
										defaultValue={editingReceipt?.category}
										required
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="type">Type</Label>
								<Select
									value={receiptType}
									onValueChange={(value: "income" | "expense") => setReceiptType(value)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="income">Income</SelectItem>
										<SelectItem value="expense">Expense</SelectItem>
									</SelectContent>
								</Select>
							</div>
							{receiptType === "income" && (
								<div className="space-y-4 border-t pt-4">
									<div className="flex justify-between items-center">
										<Label>Products Sold</Label>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={addItem}
										>
											<PlusCircle className="mr-2 h-4 w-4" />
											Add Product
										</Button>
									</div>
									{receiptItems.length > 0 && (
										<div className="space-y-2">
											{receiptItems.map((item, index) => (
												<div key={index} className="flex gap-2 items-center">
													<Select
														value={item.productId}
														onValueChange={(value) => updateItem(index, "productId", value)}
													>
														<SelectTrigger className="flex-1">
															<SelectValue placeholder="Select product" />
														</SelectTrigger>
														<SelectContent>
															{products?.map((product) => (
																<SelectItem key={product.id} value={product.id}>
																	{product.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
													<Input
														type="number"
														step="1"
														min="1"
														placeholder="Qty"
														value={item.quantity}
														onChange={(e) =>
															updateItem(index, "quantity", parseInt(e.target.value) || 1)
														}
														className="w-24"
													/>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => removeItem(index)}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											))}
										</div>
									)}
									{receiptItems.length === 0 && (
										<p className="text-sm text-muted-foreground">
											Add products to automatically deduct inventory when receipt is created.
										</p>
									)}
								</div>
							)}
							<div className="space-y-2">
								<Label htmlFor="paymentMethod">Payment Method</Label>
								<Input
									id="paymentMethod"
									name="paymentMethod"
									defaultValue={editingReceipt?.paymentMethod}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Input
									id="description"
									name="description"
									defaultValue={editingReceipt?.description}
								/>
							</div>
							<div className="flex justify-end gap-2">
								<Button type="button" variant="outline" onClick={handleCloseDialog}>
									Cancel
								</Button>
								<Button type="submit">
									{editingReceipt ? "Update" : "Create"}
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
									placeholder="Search receipts..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-8"
								/>
							</div>
						</div>
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
										<TableHead>Date</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Category</TableHead>
										<TableHead>Payment Method</TableHead>
										<TableHead className="text-right">Actions</TableHead>
									</TableRow>
							</TableHeader>
							<TableBody>
								{receipts && receipts.length > 0 ? (
									receipts.map((receipt) => (
										<TableRow key={receipt.id}>
											<TableCell>{receipt.title}</TableCell>
											<TableCell>${receipt.amount}</TableCell>
											<TableCell>
												{new Date(receipt.date).toLocaleDateString()}
											</TableCell>
											<TableCell>
												{receipt.type === "income" ? (
													<Badge variant="success">Income</Badge>
												) : (
													<Badge variant="destructive">Expense</Badge>
												)}
											</TableCell>
											<TableCell>{receipt.category}</TableCell>
											<TableCell>{receipt.paymentMethod || "N/A"}</TableCell>
											<TableCell className="text-right">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleEdit(receipt)}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDelete(receipt.id)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={7} className="text-center py-10">
											No receipts found. Create your first receipt!
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


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
import { PlusCircle, Pencil, Trash2, Search, Package, AlertTriangle } from "lucide-react";

export default function InventoryPage() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [stockDialogOpen, setStockDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<any>(null);
	const [selectedItem, setSelectedItem] = useState<any>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] = useState("all");
	const [itemType, setItemType] = useState<"kekal" | "tidak_kekal">("tidak_kekal");

	const utils = trpc.useUtils();

	// Fetch inventory
	const { data: inventoryItems, isLoading } = trpc.inventory.getAll.useQuery({
		search: searchTerm,
		type: typeFilter && typeFilter !== "all" ? (typeFilter as "kekal" | "tidak_kekal") : undefined,
	});

	// Create mutation
	const createMutation = trpc.inventory.create.useMutation({
		onSuccess: () => {
			toast.success("Inventory item created successfully");
			utils.inventory.getAll.invalidate();
			setDialogOpen(false);
		},
		onError: (error) => {
			toast.error("Failed to create inventory item: " + error.message);
		},
	});

	// Update mutation
	const updateMutation = trpc.inventory.update.useMutation({
		onSuccess: () => {
			toast.success("Inventory item updated successfully");
			utils.inventory.getAll.invalidate();
			setDialogOpen(false);
			setEditingItem(null);
		},
		onError: (error) => {
			toast.error("Failed to update inventory item: " + error.message);
		},
	});

	// Delete mutation
	const deleteMutation = trpc.inventory.delete.useMutation({
		onSuccess: () => {
			toast.success("Inventory item deleted successfully");
			utils.inventory.getAll.invalidate();
		},
		onError: (error) => {
			toast.error("Failed to delete inventory item: " + error.message);
		},
	});

	// Add stock mutation
	const addStockMutation = trpc.inventory.addStock.useMutation({
		onSuccess: () => {
			toast.success("Stock added successfully");
			utils.inventory.getAll.invalidate();
			setStockDialogOpen(false);
		},
		onError: (error) => {
			toast.error("Failed to add stock: " + error.message);
		},
	});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const data = {
			name: formData.get("name") as string,
			type: itemType,
			quantity: formData.get("quantity") as string,
			unit: formData.get("unit") as string,
			costPerUnit: formData.get("costPerUnit") as string,
			description: formData.get("description") as string,
		};

		if (editingItem) {
			updateMutation.mutate({ id: editingItem.id, ...data });
		} else {
			createMutation.mutate(data);
		}
	};

	const handleEdit = (item: any) => {
		setEditingItem(item);
		setItemType(item.type || "tidak_kekal");
		setDialogOpen(true);
	};

	const handleDelete = (id: string) => {
		if (confirm("Are you sure you want to delete this inventory item?")) {
			deleteMutation.mutate({ id });
		}
	};

	const handleAdjustStock = (item: any) => {
		setSelectedItem(item);
		setStockDialogOpen(true);
	};

	const handleAddStock = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		
		if (!selectedItem || !selectedItem.id) {
			toast.error("No inventory item selected");
			return;
		}
		
		const formData = new FormData(e.currentTarget);
		addStockMutation.mutate({
			id: selectedItem.id,
			quantity: formData.get("quantity") as string,
		});
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		setEditingItem(null);
		setItemType("tidak_kekal");
	};

	const getTypeBadge = (type: string) => {
		return type === "kekal" ? (
			<Badge variant="default">Fixed Asset</Badge>
		) : (
			<Badge variant="secondary">Consumable</Badge>
		);
	};

	const isLowStock = (quantity: string) => {
		return parseFloat(quantity) < 10; // Threshold for low stock
	};

	return (
		<div className="container mx-auto py-10">
			<div className="flex justify-between items-center mb-8">
				<div className="flex items-center gap-2">
					<Package className="h-8 w-8" />
					<h1 className="text-4xl font-bold">Inventory Management</h1>
				</div>
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogTrigger asChild>
						<Button onClick={() => setEditingItem(null)}>
							<PlusCircle className="mr-2 h-4 w-4" />
							Add Inventory Item
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>
								{editingItem ? "Edit Inventory Item" : "Create New Inventory Item"}
							</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Item Name</Label>
								<Input
									id="name"
									name="name"
									defaultValue={editingItem?.name}
									required
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="type">Type</Label>
									<Select value={itemType} onValueChange={(value: "kekal" | "tidak_kekal") => setItemType(value)}>
										<SelectTrigger>
											<SelectValue placeholder="Select type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="kekal">Fixed Asset (Kekal)</SelectItem>
											<SelectItem value="tidak_kekal">Consumable (Tidak Kekal)</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="unit">Unit</Label>
									<Input
										id="unit"
										name="unit"
										placeholder="gram, pcs, kg"
										defaultValue={editingItem?.unit}
										required
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="quantity">Quantity</Label>
									<Input
										id="quantity"
										name="quantity"
										type="number"
										step="0.01"
										defaultValue={editingItem?.quantity}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="costPerUnit">Cost per Unit</Label>
									<Input
										id="costPerUnit"
										name="costPerUnit"
										type="number"
										step="0.01"
										defaultValue={editingItem?.costPerUnit}
										required
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Input
									id="description"
									name="description"
									defaultValue={editingItem?.description}
								/>
							</div>
							<div className="flex justify-end gap-2">
								<Button type="button" variant="outline" onClick={handleCloseDialog}>
									Cancel
								</Button>
								<Button type="submit">
									{editingItem ? "Update" : "Create"}
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
									placeholder="Search inventory..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-8"
								/>
							</div>
						</div>
						<Select value={typeFilter} onValueChange={setTypeFilter}>
							<SelectTrigger className="w-64">
								<SelectValue placeholder="Filter by type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								<SelectItem value="kekal">Fixed Assets</SelectItem>
								<SelectItem value="tidak_kekal">Consumables</SelectItem>
							</SelectContent>
						</Select>
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
									<TableHead>Name</TableHead>
									<TableHead>Type</TableHead>
									<TableHead>Quantity</TableHead>
									<TableHead>Unit</TableHead>
									<TableHead>Cost/Unit</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{inventoryItems && inventoryItems.length > 0 ? (
									inventoryItems.map((item) => (
										<TableRow key={item.id}>
											<TableCell className="font-medium">
												<div className="flex items-center gap-2">
													{item.name}
													{isLowStock(item.quantity) && (
														<AlertTriangle className="h-4 w-4 text-yellow-500" />
													)}
												</div>
											</TableCell>
											<TableCell>{getTypeBadge(item.type)}</TableCell>
											<TableCell
												className={
													isLowStock(item.quantity)
														? "font-bold text-yellow-600"
														: ""
												}
											>
												{item.quantity}
											</TableCell>
											<TableCell>{item.unit}</TableCell>
											<TableCell>${item.costPerUnit}</TableCell>
											<TableCell className="text-right">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleAdjustStock(item)}
												>
													Adjust Stock
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleEdit(item)}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDelete(item.id)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={6} className="text-center py-10">
											No inventory items found. Create your first item!
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Stock Adjustment Dialog */}
			{selectedItem && (
				<Dialog 
					open={stockDialogOpen} 
					onOpenChange={(open) => {
						setStockDialogOpen(open);
						if (!open) {
							setSelectedItem(null);
						}
					}}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Adjust Stock: {selectedItem.name}</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleAddStock} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="quantity">Add Quantity</Label>
								<Input
									id="quantity"
									name="quantity"
									type="number"
									step="0.01"
									placeholder="0.00"
									required
								/>
								<p className="text-sm text-muted-foreground">
									Current stock: {selectedItem.quantity} {selectedItem.unit}
								</p>
							</div>
							<div className="flex justify-end gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setStockDialogOpen(false);
										setSelectedItem(null);
									}}
								>
									Cancel
								</Button>
								<Button type="submit">Add Stock</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}


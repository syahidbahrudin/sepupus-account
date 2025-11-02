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
import { PlusCircle, Pencil, Trash2, Search, Package } from "lucide-react";

export default function ProductsPage() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [ingredientsDialogOpen, setIngredientsDialogOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<any>(null);
	const [selectedProduct, setSelectedProduct] = useState<any>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");
	const [selectedInventoryId, setSelectedInventoryId] = useState<string>("");
	const [ingredientQuantity, setIngredientQuantity] = useState<string>("");

	const utils = trpc.useUtils();

	// Fetch products
	const { data: products, isLoading } = trpc.products.getAll.useQuery({
		search: searchTerm,
		category: categoryFilter || undefined,
	});

	// Fetch inventory for ingredients
	const { data: inventoryItems } = trpc.inventory.getAll.useQuery({});

	// Fetch ingredients for selected product
	const { data: ingredients } = trpc.products.getIngredients.useQuery(
		{ productId: selectedProduct?.id || "" },
		{ enabled: !!selectedProduct }
	);

	// Create mutation
	const createMutation = trpc.products.create.useMutation({
		onSuccess: () => {
			toast.success("Product created successfully");
			utils.products.getAll.invalidate();
			setDialogOpen(false);
		},
		onError: (error) => {
			toast.error("Failed to create product: " + error.message);
		},
	});

	// Update mutation
	const updateMutation = trpc.products.update.useMutation({
		onSuccess: () => {
			toast.success("Product updated successfully");
			utils.products.getAll.invalidate();
			setDialogOpen(false);
			setEditingProduct(null);
		},
		onError: (error) => {
			toast.error("Failed to update product: " + error.message);
		},
	});

	// Delete mutation
	const deleteMutation = trpc.products.delete.useMutation({
		onSuccess: () => {
			toast.success("Product deleted successfully");
			utils.products.getAll.invalidate();
		},
		onError: (error) => {
			toast.error("Failed to delete product: " + error.message);
		},
	});

	// Add ingredient mutation
	const addIngredientMutation = trpc.products.addIngredient.useMutation({
		onSuccess: () => {
			toast.success("Ingredient added successfully");
			utils.products.getIngredients.invalidate();
		},
		onError: (error) => {
			toast.error("Failed to add ingredient: " + error.message);
		},
	});

	// Remove ingredient mutation
	const removeIngredientMutation = trpc.products.removeIngredient.useMutation({
		onSuccess: () => {
			toast.success("Ingredient removed successfully");
			utils.products.getIngredients.invalidate();
		},
		onError: (error) => {
			toast.error("Failed to remove ingredient: " + error.message);
		},
	});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const data = {
			name: formData.get("name") as string,
			price: formData.get("price") as string,
			category: formData.get("category") as string,
			description: formData.get("description") as string,
		};

		if (editingProduct) {
			updateMutation.mutate({ id: editingProduct.id, ...data });
		} else {
			createMutation.mutate(data);
		}
	};

	const handleEdit = (product: any) => {
		setEditingProduct(product);
		setDialogOpen(true);
	};

	const handleDelete = (id: string) => {
		if (confirm("Are you sure you want to delete this product?")) {
			deleteMutation.mutate({ id });
		}
	};

	const handleManageIngredients = (product: any) => {
		setSelectedProduct(product);
		setIngredientsDialogOpen(true);
	};

	const handleAddIngredient = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!selectedInventoryId || !ingredientQuantity) {
			toast.error("Please select an inventory item and enter a quantity");
			return;
		}
		addIngredientMutation.mutate({
			productId: selectedProduct.id,
			inventoryId: selectedInventoryId,
			quantity: ingredientQuantity,
		});
		setSelectedInventoryId("");
		setIngredientQuantity("");
	};

	const handleRemoveIngredient = (id: string) => {
		if (confirm("Remove this ingredient?")) {
			removeIngredientMutation.mutate({ id });
		}
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		setEditingProduct(null);
	};

	const formatCurrency = (amount: string) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(parseFloat(amount));
	};

	return (
		<div className="container mx-auto py-10">
			<div className="flex justify-between items-center mb-8">
				<div className="flex items-center gap-2">
					<Package className="h-8 w-8" />
					<h1 className="text-4xl font-bold">Products Management</h1>
				</div>
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogTrigger asChild>
						<Button onClick={() => setEditingProduct(null)}>
							<PlusCircle className="mr-2 h-4 w-4" />
							Add Product
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>
								{editingProduct ? "Edit Product" : "Create New Product"}
							</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="name">Product Name</Label>
									<Input
										id="name"
										name="name"
										defaultValue={editingProduct?.name}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="price">Price</Label>
									<Input
										id="price"
										name="price"
										type="number"
										step="0.01"
										defaultValue={editingProduct?.price}
										required
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="category">Category</Label>
								<Input
									id="category"
									name="category"
									defaultValue={editingProduct?.category}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Input
									id="description"
									name="description"
									defaultValue={editingProduct?.description}
								/>
							</div>
							<div className="flex justify-end gap-2">
								<Button type="button" variant="outline" onClick={handleCloseDialog}>
									Cancel
								</Button>
								<Button type="submit">
									{editingProduct ? "Update" : "Create"}
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
									placeholder="Search products..."
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
									<TableHead>Name</TableHead>
									<TableHead>Price</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Description</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{products && products.length > 0 ? (
									products.map((product) => (
										<TableRow key={product.id}>
											<TableCell className="font-medium">{product.name}</TableCell>
											<TableCell>{formatCurrency(product.price)}</TableCell>
											<TableCell>
												<Badge variant="secondary">{product.category}</Badge>
											</TableCell>
											<TableCell>{product.description || "N/A"}</TableCell>
											<TableCell className="text-right">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleManageIngredients(product)}
												>
													Ingredients
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleEdit(product)}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDelete(product.id)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={5} className="text-center py-10">
											No products found. Create your first product!
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Ingredients Dialog */}
			<Dialog open={ingredientsDialogOpen} onOpenChange={setIngredientsDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							Manage Ingredients: {selectedProduct?.name}
						</DialogTitle>
					</DialogHeader>

					<div className="space-y-4">
						<form onSubmit={handleAddIngredient} className="space-y-4 border-b pb-4">
							<h3 className="font-semibold">Add Ingredient</h3>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="inventoryId">Inventory Item</Label>
									<Select value={selectedInventoryId} onValueChange={setSelectedInventoryId}>
										<SelectTrigger>
											<SelectValue placeholder="Select inventory item" />
										</SelectTrigger>
										<SelectContent>
											{inventoryItems?.map((item) => (
												<SelectItem key={item.id} value={item.id}>
													{item.name} ({item.unit})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="quantity">Quantity</Label>
									<Input
										id="quantity"
										name="quantity"
										type="number"
										step="0.01"
										placeholder="0.00"
										value={ingredientQuantity}
										onChange={(e) => setIngredientQuantity(e.target.value)}
										required
									/>
								</div>
							</div>
							<Button type="submit">Add Ingredient</Button>
						</form>

						<div>
							<h3 className="font-semibold mb-4">Current Ingredients</h3>
							{ingredients && ingredients.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Inventory Item</TableHead>
											<TableHead>Quantity</TableHead>
											<TableHead>Unit</TableHead>
											<TableHead className="text-right">Action</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{ingredients.map((ingredient) => (
											<TableRow key={ingredient.id}>
												<TableCell>{ingredient.inventoryName}</TableCell>
												<TableCell>{ingredient.quantity}</TableCell>
												<TableCell>{ingredient.inventoryUnit}</TableCell>
												<TableCell className="text-right">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleRemoveIngredient(ingredient.id)}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<p className="text-sm text-muted-foreground">
									No ingredients added yet.
								</p>
							)}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}


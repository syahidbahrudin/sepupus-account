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
import { PlusCircle, Pencil, Trash2 } from "lucide-react";

export default function CategoriesPage() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<any>(null);

	const utils = trpc.useUtils();

	// Fetch categories
	const { data: categories, isLoading } = trpc.categories.getAll.useQuery({});

	// Create mutation
	const createMutation = trpc.categories.create.useMutation({
		onSuccess: () => {
			toast.success("Category created successfully");
			utils.categories.getAll.invalidate();
			setDialogOpen(false);
		},
		onError: (error) => {
			toast.error("Failed to create category: " + error.message);
		},
	});

	// Update mutation
	const updateMutation = trpc.categories.update.useMutation({
		onSuccess: () => {
			toast.success("Category updated successfully");
			utils.categories.getAll.invalidate();
			setDialogOpen(false);
			setEditingCategory(null);
		},
		onError: (error) => {
			toast.error("Failed to update category: " + error.message);
		},
	});

	// Delete mutation
	const deleteMutation = trpc.categories.delete.useMutation({
		onSuccess: () => {
			toast.success("Category deleted successfully");
			utils.categories.getAll.invalidate();
		},
		onError: (error) => {
			toast.error("Failed to delete category: " + error.message);
		},
	});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const data = {
			name: formData.get("name") as string,
			type: (formData.get("type") as any) || "both",
			description: formData.get("description") as string,
		};

		if (editingCategory) {
			updateMutation.mutate({ id: editingCategory.id, ...data });
		} else {
			createMutation.mutate(data);
		}
	};

	const handleEdit = (category: any) => {
		setEditingCategory(category);
		setDialogOpen(true);
	};

	const handleDelete = (id: string) => {
		if (confirm("Are you sure you want to delete this category?")) {
			deleteMutation.mutate({ id });
		}
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		setEditingCategory(null);
	};

	const getTypeBadge = (type: string) => {
		switch (type) {
			case "receipt":
				return <Badge variant="secondary">Receipt</Badge>;
			case "expense":
				return <Badge variant="outline">Expense</Badge>;
			case "both":
				return <Badge>Both</Badge>;
			default:
				return <Badge>{type}</Badge>;
		}
	};

	return (
		<div className="container mx-auto py-10">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-4xl font-bold">Categories Management</h1>
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogTrigger asChild>
						<Button onClick={() => setEditingCategory(null)}>
							<PlusCircle className="mr-2 h-4 w-4" />
							Add Category
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{editingCategory ? "Edit Category" : "Create New Category"}
							</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Name</Label>
								<Input
									id="name"
									name="name"
									defaultValue={editingCategory?.name}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="type">Type</Label>
								<Select name="type" defaultValue={editingCategory?.type || "both"}>
									<SelectTrigger>
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="both">Both</SelectItem>
										<SelectItem value="receipt">Receipt</SelectItem>
										<SelectItem value="expense">Expense</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="description">Description</Label>
								<Input
									id="description"
									name="description"
									defaultValue={editingCategory?.description}
								/>
							</div>
							<div className="flex justify-end gap-2">
								<Button type="button" variant="outline" onClick={handleCloseDialog}>
									Cancel
								</Button>
								<Button type="submit">
									{editingCategory ? "Update" : "Create"}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>

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
									<TableHead>Description</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{categories && categories.length > 0 ? (
									categories.map((category) => (
										<TableRow key={category.id}>
											<TableCell className="font-medium">{category.name}</TableCell>
											<TableCell>{getTypeBadge(category.type)}</TableCell>
											<TableCell>{category.description || "N/A"}</TableCell>
											<TableCell className="text-right">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleEdit(category)}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDelete(category.id)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={4} className="text-center py-10">
											No categories found. Create your first category!
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


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

export default function InvoicesPage() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingInvoice, setEditingInvoice] = useState<any>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	const utils = trpc.useUtils();

	// Fetch invoices
	const { data: invoices, isLoading } = trpc.invoices.getAll.useQuery({
		search: searchTerm,
		status: statusFilter === "all" ? undefined : (statusFilter as any),
	});

	// Create mutation
	const createMutation = trpc.invoices.create.useMutation({
		onSuccess: () => {
			toast.success("Invoice created successfully");
			utils.invoices.getAll.invalidate();
			setDialogOpen(false);
		},
		onError: (error) => {
			toast.error("Failed to create invoice: " + error.message);
		},
	});

	// Update mutation
	const updateMutation = trpc.invoices.update.useMutation({
		onSuccess: () => {
			toast.success("Invoice updated successfully");
			utils.invoices.getAll.invalidate();
			setDialogOpen(false);
			setEditingInvoice(null);
		},
		onError: (error) => {
			toast.error("Failed to update invoice: " + error.message);
		},
	});

	// Delete mutation
	const deleteMutation = trpc.invoices.delete.useMutation({
		onSuccess: () => {
			toast.success("Invoice deleted successfully");
			utils.invoices.getAll.invalidate();
		},
		onError: (error) => {
			toast.error("Failed to delete invoice: " + error.message);
		},
	});

	// Update status mutation
	const updateStatusMutation = trpc.invoices.updateStatus.useMutation({
		onSuccess: () => {
			toast.success("Invoice status updated");
			utils.invoices.getAll.invalidate();
		},
		onError: (error) => {
			toast.error("Failed to update status: " + error.message);
		},
	});

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const data = {
			clientName: formData.get("clientName") as string,
			clientEmail: formData.get("clientEmail") as string,
			clientAddress: formData.get("clientAddress") as string,
			service: formData.get("service") as string,
			totalAmount: formData.get("totalAmount") as string,
			dueDate: formData.get("dueDate") as string,
			status: (formData.get("status") as any) || "pending",
			notes: formData.get("notes") as string,
		};

		if (editingInvoice) {
			updateMutation.mutate({ id: editingInvoice.id, ...data });
		} else {
			createMutation.mutate(data);
		}
	};

	const handleEdit = (invoice: any) => {
		setEditingInvoice(invoice);
		setDialogOpen(true);
	};

	const handleDelete = (id: string) => {
		if (confirm("Are you sure you want to delete this invoice?")) {
			deleteMutation.mutate({ id });
		}
	};

	const handleStatusChange = (id: string, status: string) => {
		updateStatusMutation.mutate({ id, status: status as any });
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		setEditingInvoice(null);
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "paid":
				return <Badge variant="success">Paid</Badge>;
			case "unpaid":
				return <Badge variant="destructive">Unpaid</Badge>;
			case "pending":
				return <Badge variant="warning">Pending</Badge>;
			case "overdue":
				return <Badge variant="destructive">Overdue</Badge>;
			default:
				return <Badge>{status}</Badge>;
		}
	};

	return (
		<div className="container mx-auto py-10">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-4xl font-bold">Invoices Management</h1>
				<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<DialogTrigger asChild>
						<Button onClick={() => setEditingInvoice(null)}>
							<PlusCircle className="mr-2 h-4 w-4" />
							Add Invoice
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>
								{editingInvoice ? "Edit Invoice" : "Create New Invoice"}
							</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="clientName">Client Name</Label>
									<Input
										id="clientName"
										name="clientName"
										defaultValue={editingInvoice?.clientName}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="clientEmail">Client Email</Label>
									<Input
										id="clientEmail"
										name="clientEmail"
										type="email"
										defaultValue={editingInvoice?.clientEmail}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="clientAddress">Client Address</Label>
								<Input
									id="clientAddress"
									name="clientAddress"
									defaultValue={editingInvoice?.clientAddress}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="service">Service</Label>
								<Input
									id="service"
									name="service"
									defaultValue={editingInvoice?.service}
									required
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="totalAmount">Total Amount</Label>
									<Input
										id="totalAmount"
										name="totalAmount"
										type="number"
										step="0.01"
										defaultValue={editingInvoice?.totalAmount}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="dueDate">Due Date</Label>
									<Input
										id="dueDate"
										name="dueDate"
										type="date"
										defaultValue={
											editingInvoice?.dueDate
												? new Date(editingInvoice.dueDate).toISOString().split("T")[0]
												: ""
										}
										required
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="status">Status</Label>
								<Select name="status" defaultValue={editingInvoice?.status || "pending"}>
									<SelectTrigger>
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="pending">Pending</SelectItem>
										<SelectItem value="paid">Paid</SelectItem>
										<SelectItem value="unpaid">Unpaid</SelectItem>
										<SelectItem value="overdue">Overdue</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="notes">Notes</Label>
								<Input
									id="notes"
									name="notes"
									defaultValue={editingInvoice?.notes}
								/>
							</div>
							<div className="flex justify-end gap-2">
								<Button type="button" variant="outline" onClick={handleCloseDialog}>
									Cancel
								</Button>
								<Button type="submit">
									{editingInvoice ? "Update" : "Create"}
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
									placeholder="Search invoices..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-8"
								/>
							</div>
						</div>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-64">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="pending">Pending</SelectItem>
								<SelectItem value="paid">Paid</SelectItem>
								<SelectItem value="unpaid">Unpaid</SelectItem>
								<SelectItem value="overdue">Overdue</SelectItem>
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
									<TableHead>Client</TableHead>
									<TableHead>Service</TableHead>
									<TableHead>Amount</TableHead>
									<TableHead>Due Date</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{invoices && invoices.length > 0 ? (
									invoices.map((invoice) => (
										<TableRow key={invoice.id}>
											<TableCell>{invoice.clientName}</TableCell>
											<TableCell>{invoice.service}</TableCell>
											<TableCell>${invoice.totalAmount}</TableCell>
											<TableCell>
												{new Date(invoice.dueDate).toLocaleDateString()}
											</TableCell>
											<TableCell>{getStatusBadge(invoice.status)}</TableCell>
											<TableCell className="text-right">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleEdit(invoice)}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDelete(invoice.id)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={6} className="text-center py-10">
											No invoices found. Create your first invoice!
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


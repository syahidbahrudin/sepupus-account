"use client";

import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield } from "lucide-react";

export default function UsersPage() {
	const utils = trpc.useUtils();

	// Fetch all users
	const { data: users, isLoading } = trpc.users.getAll.useQuery();

	// Update role mutation
	const updateRoleMutation = trpc.users.updateRole.useMutation({
		onSuccess: () => {
			toast.success("User role updated successfully");
			utils.users.getAll.invalidate();
		},
		onError: (error) => {
			toast.error("Failed to update role: " + error.message);
		},
	});

	const handleRoleChange = (userId: string, role: string) => {
		updateRoleMutation.mutate({ userId, role: role as any });
	};

	const getRoleBadge = (role: string) => {
		switch (role) {
			case "admin":
				return <Badge variant="destructive">Admin</Badge>;
			case "finance":
				return <Badge variant="default">Finance</Badge>;
			case "viewer":
				return <Badge variant="secondary">Viewer</Badge>;
			default:
				return <Badge>{role}</Badge>;
		}
	};

	if (isLoading) {
		return (
			<div className="container mx-auto py-10">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-10">
			<div className="flex items-center gap-2 mb-8">
				<Shield className="h-8 w-8" />
				<h1 className="text-4xl font-bold">User Management</h1>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Users</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Current Role</TableHead>
								<TableHead>Email Verified</TableHead>
								<TableHead>Joined</TableHead>
								<TableHead className="text-right">Change Role</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users && users.length > 0 ? (
								users.map((user) => (
									<TableRow key={user.id}>
										<TableCell className="font-medium">{user.name}</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>{getRoleBadge(user.role)}</TableCell>
										<TableCell>
											{user.emailVerified ? (
												<Badge variant="success">Verified</Badge>
											) : (
												<Badge variant="warning">Not Verified</Badge>
											)}
										</TableCell>
										<TableCell>
											{new Date(user.createdAt).toLocaleDateString()}
										</TableCell>
										<TableCell className="text-right">
											<Select
												defaultValue={user.role}
												onValueChange={(value) => handleRoleChange(user.id, value)}
											>
												<SelectTrigger className="w-32">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="viewer">Viewer</SelectItem>
													<SelectItem value="finance">Finance</SelectItem>
													<SelectItem value="admin">Admin</SelectItem>
												</SelectContent>
											</Select>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={6} className="text-center py-10">
										No users found
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<Card className="mt-6">
				<CardHeader>
					<CardTitle>Role Permissions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div>
							<h3 className="font-semibold mb-2">Admin</h3>
							<p className="text-sm text-muted-foreground">
								Full access to all features including user management, can create, read, update, and delete all records.
							</p>
						</div>
						<div>
							<h3 className="font-semibold mb-2">Finance</h3>
							<p className="text-sm text-muted-foreground">
								Can create, read, and update receipts, invoices, and expenses. Cannot delete records or manage users.
							</p>
						</div>
						<div>
							<h3 className="font-semibold mb-2">Viewer</h3>
							<p className="text-sm text-muted-foreground">
								Read-only access to all financial data. Cannot create, update, or delete any records.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}


"use client";

import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { hasPermission, Permission, UserRole } from "@/lib/rbac";

interface RoleGuardProps {
	children: ReactNode;
	permission: Permission;
	fallback?: ReactNode;
}

export function RoleGuard({ children, permission, fallback = null }: RoleGuardProps) {
	const { data: currentUser } = trpc.users.getCurrentUser.useQuery();

	if (!currentUser) {
		return <>{fallback}</>;
	}

	const userRole = currentUser.role as UserRole;
	
	if (!hasPermission(userRole, permission)) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
}

interface RoleBasedButtonProps {
	children: ReactNode;
	permission: Permission;
	fallback?: ReactNode;
}

export function RoleBasedButton({ children, permission, fallback = null }: RoleBasedButtonProps) {
	return (
		<RoleGuard permission={permission} fallback={fallback}>
			{children}
		</RoleGuard>
	);
}


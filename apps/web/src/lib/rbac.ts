// Role-Based Access Control utilities

export type UserRole = "admin" | "finance" | "viewer";

export const permissions = {
  // Receipt permissions
  "receipts:create": ["admin", "finance"],
  "receipts:read": ["admin", "finance", "viewer"],
  "receipts:update": ["admin", "finance"],
  "receipts:delete": ["admin"],

  // Invoice permissions
  "invoices:create": ["admin", "finance"],
  "invoices:read": ["admin", "finance", "viewer"],
  "invoices:update": ["admin", "finance"],
  "invoices:delete": ["admin"],

  // Expense permissions
  "expenses:create": ["admin", "finance"],
  "expenses:read": ["admin", "finance", "viewer"],
  "expenses:update": ["admin", "finance"],
  "expenses:delete": ["admin"],

  // Category permissions
  "categories:create": ["admin"],
  "categories:read": ["admin", "finance", "viewer"],
  "categories:update": ["admin"],
  "categories:delete": ["admin"],

  // Report permissions
  "reports:read": ["admin", "finance", "viewer"],

  // User management permissions
  "users:read": ["admin"],
  "users:update": ["admin"],
} as const;

export type Permission = keyof typeof permissions;

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const allowedRoles = permissions[permission] as readonly UserRole[];
  return allowedRoles.includes(role);
}

export function canCreate(role: UserRole): boolean {
  return role === "admin" || role === "finance";
}

export function canUpdate(role: UserRole): boolean {
  return role === "admin" || role === "finance";
}

export function canDelete(role: UserRole): boolean {
  return role === "admin";
}

export function isAdmin(role: UserRole): boolean {
  return role === "admin";
}

export function isFinance(role: UserRole): boolean {
  return role === "finance";
}

export function isViewer(role: UserRole): boolean {
  return role === "viewer";
}

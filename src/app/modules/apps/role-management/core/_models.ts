import { ID, Response } from "../../../../../_metronic/helpers";

// Permission Model
export type Permission = {
  id?: ID;
  name: string;
  slug: string; // e.g., "course.create", "student.view"
  module: string; // e.g., "Courses", "Students", "Assignments"
  description?: string;
  createdAt?: string;
};

// Role Model
export type Role = {
  id?: ID;
  name: string;
  slug: string; // e.g., "admin", "instructor", "student"
  description?: string;
  permissions?: Permission[];
  permissionIds?: ID[];
  userCount?: number;
  isSystemRole?: boolean; // Cannot be deleted (Admin, Student, etc.)
  status: "Active" | "Inactive";
  createdAt?: string;
  updatedAt?: string;
};

// Role with Permissions (for detailed view)
export type RoleWithPermissions = Role & {
  permissions: Permission[];
};

// Query Response Types
export type RolesQueryResponse = Response<Array<Role>>;
export type PermissionsQueryResponse = Response<Array<Permission>>;

// Initial Values
export const initialRole: Role = {
  id: undefined,
  name: "",
  slug: "",
  description: "",
  permissions: [],
  permissionIds: [],
  userCount: 0,
  isSystemRole: false,
  status: "Active",
};

export const initialPermission: Permission = {
  id: undefined,
  name: "",
  slug: "",
  module: "",
  description: "",
};

// Permission Modules (Categories)
export const PERMISSION_MODULES = [
  "Courses",
  "Students",
  "Instructors",
  "Assignments",
  "Grades",
  "Categories",
  "Enrollments",
  "Reports",
  "Settings",
  "Users",
] as const;

// Common Permissions Structure
export const PERMISSION_ACTIONS = [
  { action: "view", label: "View" },
  { action: "create", label: "Create" },
  { action: "edit", label: "Edit" },
  { action: "delete", label: "Delete" },
  { action: "manage", label: "Manage All" },
] as const;

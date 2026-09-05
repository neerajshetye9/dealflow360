import { db } from "../config/database";
import { UserRole } from "../types";

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RoleRecord {
  id: string;
  name: UserRole;
  description?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface PermissionRecord {
  id: string;
  code: string;
  description?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserRoleRecord {
  user_id: string;
  role_id: string;
}

export const usersTable = () => db<UserRecord>("users");
export const rolesTable = () => db<RoleRecord>("roles");
export const permissionsTable = () => db<PermissionRecord>("permissions");
export const userRolesTable = () => db<UserRoleRecord>("user_roles");

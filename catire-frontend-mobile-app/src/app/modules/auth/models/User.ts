import { Module, Permission } from "../../../shared/api/enums";

type ModulesPermissions = {
  [module in Module]: Permission[];
};

export interface Role {
  id: number;
  name: string;
  permissions: Module[];
  permissions_json: ModulesPermissions;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface User {
  id: number;
  role_id: number;
  full_name: string;
  email: string;
  dni: number;
  phone_1: string;
  phone_2?: string | null;
  password?: string;
  branch_id?: number | null;
  provider?: string;
  google_id?: string | null;
  avatar_url?: string | null;
  role: Role;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface UserDTO {
  full_name: string;
  email: string;
  dni: number;
  phone_1: string;
  phone_2?: string;
  password: string;
}
type Module =
  | 'Users'
  | 'Roles'
  | 'Branches'
  | 'Products'
  | 'Menus'
  | 'Orders'
  | 'Purchases';
type Permission = 'create' | 'read' | 'update' | 'delete';

type PermissionJson = {
  [module in Module]?: Permission[];
};

interface Role {
  name: string;
  id: number;
  permissions: Module[];
  permissions_json: PermissionJson | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface User {
  full_name: string;
  role_id: number;
  email: string;
  dni: number;
  phone_1: string;
  phone_2: string | null;
  password: string;
  id: number;
  branch_id?: number | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  role: Role;
}

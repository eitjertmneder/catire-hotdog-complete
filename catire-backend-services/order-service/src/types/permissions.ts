export type Role = 'client' | 'employee' | 'admin';
export type Module =
  | 'Users'
  | 'Roles'
  | 'Branches'
  | 'Products'
  | 'Menus'
  | 'Orders'
  | 'Purchases';
export type Permission = 'create' | 'read' | 'update' | 'delete';

export type ModulesPermissions = {
  [module in Module]: Permission[];
};

export type DefaultPermissions = {
  [role in Role]: ModulesPermissions;
};

export interface PermissionMetadata {
  module: Module;
  action: Permission;
}

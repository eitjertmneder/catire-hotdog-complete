export type Role = 'client' | 'employee' | 'admin';
type Module =
  | 'Users'
  | 'Roles'
  | 'Branches'
  | 'Products'
  | 'Menus'
  | 'Orders'
  | 'Purchases'
  | 'Ingredients';
type Permission = 'create' | 'read' | 'update' | 'delete';

type ModulesPermissions = {
  [module in Module]: Permission[];
};

export type DefaultPermissions = {
  [role in Role]: ModulesPermissions;
};

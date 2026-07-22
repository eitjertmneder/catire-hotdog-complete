import { SetMetadata } from '@nestjs/common';
import { Module, Permission, PermissionMetadata } from '../types/permissions';

export const PERMISSION_KEY = 'permission';
export const CheckPermission = (moduleName: Module, action: Permission) =>
  SetMetadata<string, PermissionMetadata>(PERMISSION_KEY, {
    module: moduleName,
    action,
  });

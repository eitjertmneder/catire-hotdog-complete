import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class AccessTokenDTO {
  @IsString({
    message: 'accessToken: El token debe ser de tipo texto.',
  })
  @IsNotEmpty({
    message: 'accessToken: El token es requerido.',
  })
  access_token!: string;

  @IsString({
    message: 'message: El mensaje debe ser de tipo texto.',
  })
  @IsNotEmpty({
    message: 'message: El mensaje es requerido.',
  })
  message!: string;
}

export class TokenPairDTO {
  @IsString({
    message: 'accessToken: El token debe ser de tipo texto.',
  })
  @IsNotEmpty({
    message: 'accessToken: El token es requerido.',
  })
  access_token!: string;

  @IsString({
    message: 'refreshToken: El token debe ser de tipo texto.',
  })
  @IsNotEmpty({
    message: 'refreshToken: El token es requerido.',
  })
  refresh_token!: string;

  @IsString({
    message: 'message: El mensaje debe ser de tipo texto.',
  })
  @IsNotEmpty({
    message: 'message: El mensaje es requerido.',
  })
  message!: string;
}

export class LogoutDTO {
  @IsString({
    message: 'refreshToken: El token debe ser de tipo texto.',
  })
  @IsNotEmpty({
    message: 'refreshToken: El token es requerido.',
  })
  refreshToken!: string;
}

export class PermissionCheckDTO {
  @IsString({
    message: 'module: El módulo debe ser de tipo texto.',
  })
  @IsNotEmpty({
    message: 'module: El módulo es requerido.',
  })
  @IsIn(
    ['Users', 'Roles', 'Branches', 'Products', 'Menus', 'Orders', 'Purchases'],
    {
      message:
        'module: El módulo debe ser uno de los siguientes: Users, Roles, Branches, Products, Menus, Orders, Purchases.',
    },
  )
  module!: string;

  @IsString({
    message: 'action: La acción debe ser de tipo texto.',
  })
  @IsNotEmpty({
    message: 'action: La acción es requerida.',
  })
  @IsIn(['create', 'read', 'update', 'delete'], {
    message:
      'action: La acción debe ser una de las siguientes: create, read, update, delete.',
  })
  action!: string;

  @IsString({
    message: 'token: El token debe ser de tipo texto.',
  })
  @IsNotEmpty({
    message: 'token: El token es requerido.',
  })
  token!: string;
}

import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  Validate,
} from 'class-validator';
import { IsRelationship } from 'src/prisma/validator/IsRelationship.validator';
import { IsUnique } from 'src/prisma/validator/IsUnique.validator';
export class CreateUserDto {
  @IsString({ message: 'full_name: El nombre completo debe ser de texto.' })
  @IsNotEmpty({ message: 'full_name: El nombre completo es requerido.' })
  full_name!: string;

  @IsOptional()
  @IsNumber(undefined, { message: 'role_id: El id del rol debe ser numérico.' })
  @Validate(IsRelationship, ['user', 'role_id'], {
    message: 'Rol no encontrado o id incorrecto',
  })
  role_id?: number;

  @IsEmail(undefined, {
    message: 'email: Debe ser un correo válido.',
  })
  @IsNotEmpty({
    message: 'email: El correo es requerido.',
  })
  @Validate(IsUnique, ['user', 'email'], {
    message: 'email: Este correo ya existe, por favor use otro',
  })
  email!: string;

  @IsNumber(undefined, { message: 'dni: La cédula debe ser numérica.' })
  @IsNotEmpty({ message: 'dni: La cédula es requerida.' })
  dni!: number;

  @IsString({
    message: 'phone_1: El primer teléfono debe ser texto.',
  })
  @IsNotEmpty({
    message: 'phone_1: El primer teléfono es requerido.',
  })
  phone_1!: string;

  @IsOptional()
  @IsString({
    message: 'phone_2: El segundo teléfono debe ser texto.',
  })
  phone_2?: string;

  @IsOptional()
  @IsNumber(undefined, { message: 'branch_id: El ID de sucursal debe ser numérico.' })
  branch_id?: number;

  @IsString({ message: 'password: La clave debe ser texto' })
  @IsNotEmpty({ message: 'password: La clave es requerida' })
  @MinLength(8, {
    message: 'password: La clave debe tener un minimo de 8 caracteres.',
  })
  password!: string;
}


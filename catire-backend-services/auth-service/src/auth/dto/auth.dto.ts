import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export default class AuthDTO {
  @IsNotEmpty({ message: 'email: El correo es requerido.' })
  @IsString({ message: 'email: El correo debe ser de tipo texto.' })
  @IsEmail(undefined, { message: 'email: El correo debe ser válido.' })
  email!: string;

  @IsNotEmpty({ message: 'password: La clave es requerida.' })
  @IsString({ message: 'password: La clave debe ser de tipo texto.' })
  @MinLength(6, {
    message: 'password: La clave debe tener un mínimo de 6 caracteres.',
  })
  password!: string;
}

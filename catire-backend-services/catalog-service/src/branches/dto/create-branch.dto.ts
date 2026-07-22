import { IsNumber, IsString, Max, Min, Validate } from 'class-validator';
import { IsUnique } from 'src/prisma/validator/IsUnique.validator';

export class CreateBranchDTO {
  @IsString({
    message: 'name: El nombre debe ser tipo texto.',
  })
  @Validate(IsUnique, ['branch', 'name'], {
    message: 'name: El nombre ya existe.',
  })
  @Validate(IsUnique, ['branch', 'name'], {
    message: 'name: El nombre ya existe.',
  })
  name!: string;

  @IsNumber(undefined, {
    message: 'coordinates_long: Las coordenadas longitud deben ser numérica.',
  })
  @Min(-180, {
    message: 'coordinates_long: El valor mínimo debe ser -180',
  })
  @Max(180, {
    message: 'coordinates_long: El valor máximo debe ser 180',
  })
  @Validate(IsUnique, ['branch', 'coordinates_long'], {
    message: 'coordinates_long: La longitud ya existe.',
  })
  coordinates_long!: number;

  @IsNumber(undefined, {
    message: 'coordinates_lat: Las coordenadas latitud deben ser numérica.',
  })
  @Min(-90, {
    message: 'coordinates_lat: El valor mínimo debe ser -90',
  })
  @Max(90, {
    message: 'coordinates_lat: El valor máximo debe ser 90',
  })
  @Validate(IsUnique, ['branch', 'coordinates_lat'], {
    message: 'coordinates_lat: La latitud ya existe.',
  })
  coordinates_lat!: number;
}

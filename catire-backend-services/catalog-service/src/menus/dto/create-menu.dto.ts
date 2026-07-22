import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { IsRelationship } from 'src/prisma/validator/IsRelationship.validator';
import { IsUnique } from 'src/prisma/validator/IsUnique.validator';

export class CreateMenuDTO {
  @IsNotEmpty({
    message: 'name: El nombre es requerido.',
  })
  @IsString({
    message: 'name: El nombre debe ser texto.',
  })
  @Validate(IsUnique, ['menu', 'name'], {
    message: 'name: El nombre del menú ya existe.',
  })
  name!: string;

  @IsNotEmpty({
    message: 'branch_id: El ID de la sucursal es requerido.',
  })
  @Validate(IsRelationship, ['branch', 'id'], {
    message: 'branch_id: La sucursal no existe, o es un ID inválido.',
  })
  branch_id!: number;
}

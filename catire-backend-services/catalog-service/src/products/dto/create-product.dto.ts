import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  Validate,
} from 'class-validator';
import { IsRelationship } from 'src/prisma/validator/IsRelationship.validator';
import { IsUnique } from 'src/prisma/validator/IsUnique.validator';

export class CreateProductDTO {
  @IsNotEmpty({ message: 'menu_id: El id del menú es requerido.' })
  @IsNumber(undefined, {
    message: 'menu_id: El id del menú debe ser numérico.',
  })
  @Validate(IsRelationship, ['menu', 'id'], {
    message: 'menu_id: El menú no existe o id inválido.',
  })
  menu_id!: number;

  @IsNotEmpty({ message: 'category_id: El id de categoría es requerido.' })
  @IsNumber(undefined, {
    message: 'category_id: El id de categoría debe ser numérico.',
  })
  @Validate(IsRelationship, ['category', 'id'], {
    message: 'category_id: La categoría no existe o id inválido.',
  })
  category_id!: number;

  @IsNotEmpty({ message: 'name: El nombre es requerido.' })
  @IsString({ message: 'name: El nombre debe ser texto.' })
  @Validate(IsUnique, ['product', 'name'], {
    message: 'name: El nombre del producto ya existe.',
  })
  name!: string;

  @IsNotEmpty({ message: 'img_src: La ruta de la imagen es requerida.' })
  @IsString({ message: 'img_src: La ruta de la imagen debe ser texto.' })
  @IsUrl(
    {},
    { message: 'img_src: La ruta de la imagen debe ser una URL válida.' },
  )
  img_src!: string;
}

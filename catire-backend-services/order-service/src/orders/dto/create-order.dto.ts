import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NameTag, Prisma } from '@prisma/client';

export class AddressDTO {
  [key: string]: Prisma.InputJsonValue | undefined;
  @IsNotEmpty({
    message: 'street: La calle es obligatoria.',
  })
  @IsNumber(undefined, {
    message: 'street: La calle debe ser un número.',
  })
  street!: number;

  @IsNotEmpty({
    message: 'avenue: La carrera es obligatoria.',
  })
  @IsNumber(undefined, {
    message: 'avenue: La carrera debe ser un número.',
  })
  avenue!: number;

  @IsNotEmpty({
    message: 'house_number: El número de casa es obligatorio.',
  })
  @IsNumber(undefined, {
    message: 'house_number: El número de casa debe ser un número.',
  })
  house_number!: number;

  @IsOptional()
  @IsString({
    message: 'reference: La referencia debe ser una cadena de texto.',
  })
  reference?: string;
}

export class FeaturesDTO {
  @IsNotEmpty({
    message: 'name_tag: El nombre de la caracteristica es requerida.',
  })
  @IsString({
    message:
      'name_tag: El nombre de la caracteristica debe ser una cadena de texto.',
  })
  @IsEnum(NameTag, {
    message: `name_tag: El nombre debe tener estos valores: ${Object.keys(NameTag).join(', ')}`,
  })
  name_tag!: NameTag;

  @IsNotEmpty({
    message: 'value: El valor de la caracteristica es requerida.',
  })
  @IsString({
    message:
      'value: El valor de la caracteristica debe ser una cadena de texto.',
  })
  value!: string;
}
export class CreateOrderDTO {
  @IsNotEmpty({
    message: 'is_delivery: El valor si es delivery es obligatorio.',
  })
  @IsBoolean({
    message:
      'is_delivery: El valor de is_delivery debe ser booleano (true/false).',
  })
  is_delivery!: boolean;

  @IsOptional()
  @IsNumber(undefined, {
    message: 'branch_id: El ID de la sucursal debe ser numérico.',
  })
  branch_id?: number;

  @IsOptional()
  @IsString({
    message: 'payment_method: El método de pago debe ser una cadena de texto.',
  })
  payment_method?: string;

  @IsOptional()
  @IsString({
    message: 'payment_proof: El comprobante de pago debe ser una cadena de texto.',
  })
  payment_proof?: string;

  @IsNotEmpty({
    message: 'items: Los detalles de la orden son obligatorios.',
  })
  @IsArray({
    message: 'items: Los detalles de la orden deben ser una lista valida.',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDTO)
  items!: CreateOrderItemDTO[];

  @IsOptional()
  @IsString({
    message: 'notes: Las notas deben ser una cadena de texto.',
  })
  notes?: string;

  @ValidateIf((o: CreateOrderDTO) => o.is_delivery)
  @IsNotEmpty({
    message:
      'address: La dirección es obligatoria para pedidos de delivery (Debe ser un objeto).',
  })
  @ValidateNested()
  @Type(() => AddressDTO)
  address!: AddressDTO;
}

export class CreateOrderItemDTO {
  @IsNotEmpty({
    message: 'product_id: El ID del producto es obligatorio.',
  })
  @IsNumber(undefined, {
    message: 'product_id: El ID del producto debe ser numérico.',
  })
  product_id!: number;

  @IsNotEmpty({
    message: 'quantity: La cantidad es obligatoria.',
  })
  @IsNumber(undefined, {
    message: 'quantity: La cantidad debe ser numérica.',
  })
  quantity!: number;

  @IsNotEmpty({ message: 'base_price: El precio base es requerido.' })
  @IsNumber(undefined, {
    message: 'base_price: El precio base debe ser numérico.',
  })
  @Min(0, { message: 'base_price: El precio debe ser >= 0' })
  base_price!: number;

  @IsNotEmpty({
    message: 'features: Las caracteristicas son requeridas.',
  })
  @ValidateNested({ each: true })
  @Type(() => FeaturesDTO)
  features!: FeaturesDTO[];
}

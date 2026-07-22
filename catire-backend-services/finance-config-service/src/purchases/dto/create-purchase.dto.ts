import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePurchaseDTO {
  @IsNotEmpty({
    message: 'order_id: El ID de la orden es obligatorio.',
  })
  @IsString({
    message: 'order_id: El ID de la orden debe ser una cadena de texto.',
  })
  order_id!: string;

  @IsNumber(
    {},
    {
      message: 'purchase_additional: El valor adicional debe ser numérico.',
    },
  )
  @IsOptional()
  @Min(0)
  purchase_additional!: number;

  @IsOptional()
  @IsString({
    message: 'notes: Las notas deben ser texto.',
  })
  notes?: string;

  @IsOptional()
  @IsString({
    message: 'invoice_number: El número de factura debe ser texto.',
  })
  invoice_number?: string;
}

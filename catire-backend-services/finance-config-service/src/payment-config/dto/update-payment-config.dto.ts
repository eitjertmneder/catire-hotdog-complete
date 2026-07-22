import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdatePaymentConfigDTO {
  @IsOptional()
  @IsString({ message: 'holder_name: El nombre debe ser texto.' })
  holder_name?: string;

  @IsOptional()
  @IsString({ message: 'holder_dni: La cédula debe ser texto.' })
  holder_dni?: string;

  @IsOptional()
  @IsString({ message: 'phone: El teléfono debe ser texto.' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'bank: El banco debe ser texto.' })
  bank?: string;

  @IsOptional()
  @IsBoolean({ message: 'is_active: Debe ser verdadero o falso.' })
  is_active?: boolean;
}

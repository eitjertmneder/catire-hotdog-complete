import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentConfigDTO {
  @IsNotEmpty({ message: 'holder_name: El nombre del titular es obligatorio.' })
  @IsString({ message: 'holder_name: El nombre debe ser texto.' })
  holder_name!: string;

  @IsNotEmpty({ message: 'holder_dni: La cédula es obligatoria.' })
  @IsString({ message: 'holder_dni: La cédula debe ser texto.' })
  holder_dni!: string;

  @IsNotEmpty({ message: 'phone: El teléfono es obligatorio.' })
  @IsString({ message: 'phone: El teléfono debe ser texto.' })
  phone!: string;

  @IsNotEmpty({ message: 'bank: El banco es obligatorio.' })
  @IsString({ message: 'bank: El banco debe ser texto.' })
  bank!: string;
}

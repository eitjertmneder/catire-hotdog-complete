import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateRatesDTO {
  @IsNotEmpty({ message: 'rate_cop: La tasa de COP es obligatoria.' })
  @IsNumber({}, { message: 'rate_cop: La tasa de COP debe ser numérica.' })
  @Min(0, { message: 'rate_cop: La tasa de COP debe ser mayor a 0.' })
  rate_cop!: number;

  @IsNotEmpty({ message: 'rate_bs: La tasa de BS es obligatoria.' })
  @IsNumber({}, { message: 'rate_bs: La tasa de BS debe ser numérica.' })
  @Min(0, { message: 'rate_bs: La tasa de BS debe ser mayor a 0.' })
  rate_bs!: number;
}

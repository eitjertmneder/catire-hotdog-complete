import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateIngredientDTO {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  name_tag?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @IsOptional()
  stock?: number;
}

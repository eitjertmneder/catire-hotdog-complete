import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDTO {
  @IsNotEmpty({
    message: 'order_id: El ID de la orden es obligatorio.',
  })
  @IsString({
    message: 'order_id: El ID de la orden debe ser una cadena de texto.',
  })
  order_id!: string;

  @IsNotEmpty({
    message: 'rating: La calificación es obligatoria.',
  })
  @IsInt({
    message: 'rating: La calificación debe ser un número entero.',
  })
  @Min(1, {
    message: 'rating: La calificación mínima es 1.',
  })
  @Max(5, {
    message: 'rating: La calificación máxima es 5.',
  })
  rating!: number;

  @IsOptional()
  @IsString({
    message: 'comment: El comentario debe ser una cadena de texto.',
  })
  comment?: string;
}

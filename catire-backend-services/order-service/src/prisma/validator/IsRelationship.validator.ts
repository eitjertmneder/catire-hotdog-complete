import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PrismaService } from '../prisma.service';

@ValidatorConstraint({
  name: 'IsRelationship',
  async: true,
})
@Injectable()
export class IsRelationship implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) {}

  async validate(
    value: string | number,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    if (!value || value == 0) {
      return false;
    }
    const [model, field] = validationArguments?.constraints as [string, string];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const obj = await this.prisma[model].findFirst({
      where: { [field]: value },
      select: { [field]: true },
    });

    return !!obj;
  }
}

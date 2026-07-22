import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PrismaService } from '../prisma.service';

@ValidatorConstraint({
  name: 'IsUnique',
  async: true,
})
@Injectable()
export class IsUnique implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) {}

  async validate(
    value: string | number,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    const [model, field] = validationArguments?.constraints as [string, string];

    const modelClient = (
      this.prisma as unknown as Record<
        string,
        { findFirst: (args: any) => Promise<Record<string, any> | null> }
      >
    )[model];

    const obj = await modelClient.findFirst({
      where: { [field]: value },
      select: { [field]: true },
    });

    return !obj;
  }
}

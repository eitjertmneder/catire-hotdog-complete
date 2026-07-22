import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PrismaService } from '../prisma.service';

@ValidatorConstraint({
  name: 'IsMultipleRelationship',
  async: true,
})
@Injectable()
export class IsMultipleRelationship implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) {}

  async validate(
    values: number[],
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    if (!values || !Array.isArray(values) || values.length === 0) {
      return false;
    }
    const [model, field] = validationArguments?.constraints as [string, string];

    const modelClient = (
      this.prisma as unknown as Record<
        string,
        { findFirst: (args: any) => Promise<Record<string, any> | null> }
      >
    )[model];

    let valid = false;

    const results = await Promise.all(
      values.map(async (v: number) => {
        if (typeof v !== 'number' || isNaN(v)) return false;

        const obj = await modelClient.findFirst({
          where: { [field]: v },
          select: { [field]: true },
        });
        return !!obj;
      }),
    );

    valid = results.every((r) => r);

    return valid;
  }
}

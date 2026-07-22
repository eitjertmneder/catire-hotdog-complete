import { PartialType } from '@nestjs/swagger';
import { CreatePurchaseDTO } from './create-purchase.dto';

export class UpdatePurchaseDTO extends PartialType(CreatePurchaseDTO) {}

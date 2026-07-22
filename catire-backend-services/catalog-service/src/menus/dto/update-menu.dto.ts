import { PartialType } from '@nestjs/mapped-types';
import { CreateMenuDTO } from './create-menu.dto';

export class UpdateMenuDTO extends PartialType(CreateMenuDTO) {}

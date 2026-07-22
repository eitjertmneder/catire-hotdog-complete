import { NameTag, OrderStatusType } from "../../../shared/api/enums";
import { User } from "../../auth/models/User";

export interface OrderAddress {
  street: number;
  avenue: number;
  house_number: number;
  reference?: string;
}

export interface OrderFeatures {
  name_tag: NameTag;
  value: string;
}

export interface Order {
  id: string;
  user_id: number;
  branch_id?: number | null;
  user: User;
  is_delivery: boolean;
  notes?: string | null;
  address?: OrderAddress | null;
  status: OrderStatusType;
  cancel_reason?: string | null;
  payment_method?: string | null;
  items?: OrderDetails[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface OrderDetails {
  id: string;
  order_id: string;
  product_id: number;
  quantity: number;
  base_price: number;
  features: OrderFeatures[];
  order: Order;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface UserAccess {
  id: string;
  user_id: number;
  device_ip: string;
  access_error?: string | null;
  accessed_since: Date;
  created_at: Date;
  deleted_at?: Date | null;
}

export interface OrderDetailsDTO {
  product_id: number;
  quantity: number;
  base_price: number;
  features: OrderFeatures[];
}

export interface OrderDTO {
  is_delivery: boolean;
  items: OrderDetailsDTO[];
  payment_method?: 'pago_movil' | 'efectivo';
  payment_proof?: string;
  notes?: string;
  address?: OrderAddress;
}
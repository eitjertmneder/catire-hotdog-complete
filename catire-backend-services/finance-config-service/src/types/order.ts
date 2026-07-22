export interface OrderDetails {
  id: string;
  order_id: string;
  product_id: number;
  quantity: number;
  base_price: number;
  name_tag:
    | 'SIZE'
    | 'TOPPINGS'
    | 'TYPE_MEAT'
    | 'TYPE_SAUSAGE'
    | 'SAUCE'
    | 'SODA';
  value: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface Order {
  id: string;
  user_id: number;
  is_delivery: boolean;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';
  notes?: string;
  items: OrderDetails[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

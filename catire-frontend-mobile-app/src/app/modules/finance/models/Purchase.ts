export interface Purchase {
  id: string;
  order_id: string;
  user_id: number;
  purchase_base: number;
  purchase_additional: number;
  purchase_total: number;
  notes?: string | null;
  invoice_number?: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface CurrencyRate {
  id: string;
  rate_usd: number;
  rate_cop: number;
  rate_bs: number;
  last_updated: Date;
  created_at: Date;
  deleted_at?: Date | null;
}

export interface PurchaseDTO {
  order_id: string;
  purchase_additional?: number;
  notes?: string;
  invoice_number?: string;
}
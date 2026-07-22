export interface Product {
  id: number;
  menu_id: number;
  name: string;
  img_src: string;
  category_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

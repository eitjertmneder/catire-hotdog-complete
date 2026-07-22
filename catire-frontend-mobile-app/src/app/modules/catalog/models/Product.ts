export interface Category {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface Product {
  id: number;
  menu_id: number;
  category_id: number;
  name: string;
  img_src: string;
  category: Category;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface ProductDTO {
  menu_id: number;
  category_id: number;
  name: string;
  img_src: string;
}
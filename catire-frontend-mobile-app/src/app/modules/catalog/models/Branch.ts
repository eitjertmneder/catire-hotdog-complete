export interface Branch {
  id: number;
  name: string;
  coordinates_long: number;
  coordinates_lat: number;
  is_active?: boolean;
  address?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface BranchDTO {
  name: string;
  coordinates_long: number;
  coordinates_lat: number;
}
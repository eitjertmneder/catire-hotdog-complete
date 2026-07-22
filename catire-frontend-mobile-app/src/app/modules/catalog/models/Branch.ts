export interface Branch {
  id: number;
  name: string;
  coordinates_long: number;
  coordinates_lat: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface BranchDTO {
  name: string;
  coordinates_long: number;
  coordinates_lat: number;
}
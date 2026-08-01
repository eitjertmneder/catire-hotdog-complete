import { User } from "../../auth/models/User";

export interface Review {
  id: string;
  order_id: string;
  user_id: number;
  user?: User;
  rating: number;
  comment: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface CreateReviewDTO {
  order_id: string;
  rating: number;
  comment?: string;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

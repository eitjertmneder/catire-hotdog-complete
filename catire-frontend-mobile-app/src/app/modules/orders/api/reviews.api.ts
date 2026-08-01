import { Api } from '../../../shared/api/api';
import { ApiResponse } from '../../../shared/api/models';
import { Review, CreateReviewDTO, ReviewStats } from '../models/Review';

const client = new Api();

const createReview = async (token: string, payload: CreateReviewDTO): Promise<ApiResponse<Review>> => {
  return await client.post<CreateReviewDTO, Review>('orders', 'reviews', payload, token);
};

const getMyReviews = async (token: string): Promise<ApiResponse<Review[]>> => {
  return await client.get<Review[]>('orders', 'reviews/my', token);
};

const getReviewsByOrder = async (token: string, orderId: string): Promise<ApiResponse<Review[]>> => {
  return await client.get<Review[]>('orders', `reviews/order/${orderId}` as any, token);
};

const getAllReviews = async (token: string): Promise<ApiResponse<Review[]>> => {
  return await client.get<Review[]>('orders', 'reviews', token);
};

const getReviewStats = async (token: string): Promise<ApiResponse<ReviewStats>> => {
  return await client.get<ReviewStats>('orders', 'reviews/stats', token);
};

const deleteReview = async (token: string, id: string): Promise<ApiResponse<{ success: boolean }>> => {
  return await client.delete<{ success: boolean }>('orders', `reviews/${id}` as any, token);
};

export default {
  createReview,
  getMyReviews,
  getReviewsByOrder,
  getAllReviews,
  getReviewStats,
  deleteReview,
};

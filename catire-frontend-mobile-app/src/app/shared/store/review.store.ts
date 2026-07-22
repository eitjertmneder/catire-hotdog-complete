import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Review {
  id: string;
  order_id: string;
  user_id: number;
  user_name: string;
  rating: number; // 1-5
  comment: string;
  created_at: Date;
}

type ReviewState = {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'created_at'>) => void;
  getReviewsByOrder: (orderId: string) => Review[];
  getAverageRating: () => number;
  hasUserReviewedOrder: (userId: number, orderId: string) => boolean;
};

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: [],

      addReview: (review) => {
        const newReview: Review = {
          ...review,
          id: Date.now().toString(),
          created_at: new Date(),
        };
        set((state) => ({ reviews: [...state.reviews, newReview] }));
      },

      getReviewsByOrder: (orderId) => {
        return get().reviews.filter(r => r.order_id === orderId);
      },

      getAverageRating: () => {
        const { reviews } = get();
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return sum / reviews.length;
      },

      hasUserReviewedOrder: (userId, orderId) => {
        return get().reviews.some(r => r.user_id === userId && r.order_id === orderId);
      },
    }),
    {
      name: 'reviews-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

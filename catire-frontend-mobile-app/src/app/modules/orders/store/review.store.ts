import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Review, CreateReviewDTO, ReviewStats } from '../models/Review';
import reviewsApi from '../api/reviews.api';

type ReviewState = {
  reviews: Review[];
  myReviews: Review[];
  stats: ReviewStats | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;

  clearReviewError: () => void;

  fetchAllReviews: (token: string) => Promise<void>;
  fetchMyReviews: (token: string) => Promise<void>;
  fetchReviewsByOrder: (token: string, orderId: string) => Promise<void>;
  fetchReviewStats: (token: string) => Promise<void>;
  addReview: (token: string, payload: CreateReviewDTO) => Promise<void>;
  removeReview: (token: string, id: string) => Promise<void>;
};

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: [],
      myReviews: [],
      stats: null,
      loading: false,
      actionLoading: false,
      error: null,

      clearReviewError: () => set({ error: null }),

      fetchAllReviews: async (token) => {
        set({ loading: true, error: null });
        try {
          const res = await reviewsApi.getAllReviews(token);

          if (res.error) {
            set({ error: res.message });
            return;
          }

          set({ reviews: res.data || [] });
        } finally {
          set({ loading: false });
        }
      },

      fetchMyReviews: async (token) => {
        set({ loading: true, error: null });
        try {
          const res = await reviewsApi.getMyReviews(token);

          if (res.error) {
            set({ error: res.message });
            return;
          }

          set({ myReviews: res.data || [] });
        } finally {
          set({ loading: false });
        }
      },

      fetchReviewsByOrder: async (token, orderId) => {
        set({ loading: true, error: null });
        try {
          const res = await reviewsApi.getReviewsByOrder(token, orderId);

          if (res.error) {
            set({ error: res.message });
            return;
          }

          set({ reviews: res.data || [] });
        } finally {
          set({ loading: false });
        }
      },

      fetchReviewStats: async (token) => {
        try {
          const res = await reviewsApi.getReviewStats(token);

          if (res.error) {
            set({ error: res.message });
            return;
          }

          set({ stats: res.data });
        } catch {
          // silent
        }
      },

      addReview: async (token, payload) => {
        set({ actionLoading: true, error: null });
        try {
          const res = await reviewsApi.createReview(token, payload);

          if (res.error) {
            set({ error: res.message });
            return;
          }

          if (res.data) {
            set((state) => ({
              myReviews: [res.data!, ...state.myReviews],
              reviews: [res.data!, ...state.reviews],
            }));
          }
        } finally {
          set({ actionLoading: false });
        }
      },

      removeReview: async (token, id) => {
        set({ actionLoading: true, error: null });
        try {
          const res = await reviewsApi.deleteReview(token, id);

          if (res.error) {
            set({ error: res.message });
            return;
          }

          set((state) => ({
            reviews: state.reviews.filter((r) => r.id !== id),
            myReviews: state.myReviews.filter((r) => r.id !== id),
          }));
        } finally {
          set({ actionLoading: false });
        }
      },
    }),
    {
      name: 'reviews-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        myReviews: state.myReviews,
      }),
    }
  )
);

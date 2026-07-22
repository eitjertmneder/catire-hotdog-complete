import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ProductRecommendation {
  product_id: number;
  product_name: string;
  score: number;
  reason: 'frequently_bought' | 'similar' | 'popular' | 'trending';
}

type RecommendationState = {
  userHistory: { product_id: number; timestamp: Date }[];
  productAffinities: Record<number, number[]>;
  addToHistory: (productId: number) => void;
  getRecommendations: (currentProductId?: number, count?: number) => ProductRecommendation[];
  trackPurchase: (productIds: number[]) => void;
  getFrequentlyBought: (productId: number, count?: number) => number[];
  getTrendingProducts: (count?: number) => number[];
};

export const useRecommendationStore = create<RecommendationState>()(
  persist(
    (set, get) => ({
      userHistory: [],
      productAffinities: {},

      addToHistory: (productId) => {
        set((state) => ({
          userHistory: [
            { product_id: productId, timestamp: new Date() },
            ...state.userHistory.slice(0, 50),
          ],
        }));
      },

      trackPurchase: (productIds) => {
        const { productAffinities } = get();
        const newAffinities = { ...productAffinities };

        // Update affinity scores for products bought together
        productIds.forEach((id1) => {
          if (!newAffinities[id1]) newAffinities[id1] = [];
          productIds.forEach((id2) => {
            if (id1 !== id2 && !newAffinities[id1].includes(id2)) {
              newAffinities[id1].push(id2);
            }
          });
        });

        set({ productAffinities: newAffinities });
      },

      getFrequentlyBought: (productId, count = 3) => {
        const { productAffinities } = get();
        return (productAffinities[productId] || []).slice(0, count);
      },

      getTrendingProducts: (count = 5) => {
        const { userHistory } = get();
        const recentHistory = userHistory.slice(0, 20);
        
        const frequency: Record<number, number> = {};
        recentHistory.forEach((item) => {
          frequency[item.product_id] = (frequency[item.product_id] || 0) + 1;
        });

        return Object.entries(frequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, count)
          .map(([id]) => parseInt(id));
      },

      getRecommendations: (currentProductId, count = 5) => {
        const { userHistory, productAffinities } = get();
        const recommendations: ProductRecommendation[] = [];

        // Frequently bought together
        if (currentProductId && productAffinities[currentProductId]) {
          productAffinities[currentProductId].forEach((id) => {
            recommendations.push({
              product_id: id,
              product_name: '',
              score: 80,
              reason: 'frequently_bought',
            });
          });
        }

        // Popular products
        const trending = get().getTrendingProducts(count);
        trending.forEach((id) => {
          if (!recommendations.find(r => r.product_id === id)) {
            recommendations.push({
              product_id: id,
              product_name: '',
              score: 60,
              reason: 'popular',
            });
          }
        });

        // Recent history based recommendations
        const recentProducts = userHistory.slice(0, 5).map(h => h.product_id);
        recentProducts.forEach((id) => {
          if (productAffinities[id]) {
            productAffinities[id].forEach((relatedId) => {
              if (!recommendations.find(r => r.product_id === relatedId)) {
                recommendations.push({
                  product_id: relatedId,
                  product_name: '',
                  score: 40,
                  reason: 'similar',
                });
              }
            });
          }
        });

        return recommendations
          .sort((a, b) => b.score - a.score)
          .slice(0, count);
      },
    }),
    {
      name: 'recommendations-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

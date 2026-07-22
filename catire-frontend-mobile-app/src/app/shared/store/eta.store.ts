import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ETACalculation {
  order_id: string;
  preparation_time: number; // minutes
  delivery_time: number; // minutes
  total_time: number; // minutes
  estimated_arrival: Date;
  status: 'calculating' | 'ready';
}

type ETAState = {
  calculations: Record<string, ETACalculation>;
  calculateETA: (orderId: string, isDelivery: boolean, itemCount: number) => ETACalculation;
  getETA: (orderId: string) => ETACalculation | null;
  updateETATime: (orderId: string, additionalMinutes: number) => void;
};

export const useETAStore = create<ETAState>()(
  persist(
    (set, get) => ({
      calculations: {},

      calculateETA: (orderId, isDelivery, itemCount) => {
        // Base preparation time: 5 minutes per item
        const preparationTime = itemCount * 5;
        
        // Delivery time: 10-20 minutes depending on distance (simulated)
        const deliveryTime = isDelivery ? 10 + Math.floor(Math.random() * 10) : 0;
        
        const totalTime = preparationTime + deliveryTime;
        const estimatedArrival = new Date();
        estimatedArrival.setMinutes(estimatedArrival.getMinutes() + totalTime);

        const calculation: ETACalculation = {
          order_id: orderId,
          preparation_time: preparationTime,
          delivery_time: deliveryTime,
          total_time: totalTime,
          estimated_arrival: estimatedArrival,
          status: 'ready',
        };

        set((state) => ({
          calculations: { ...state.calculations, [orderId]: calculation },
        }));

        return calculation;
      },

      getETA: (orderId) => {
        return get().calculations[orderId] || null;
      },

      updateETATime: (orderId, additionalMinutes) => {
        const { calculations } = get();
        const calc = calculations[orderId];
        if (!calc) return;

        const updatedCalc = {
          ...calc,
          total_time: calc.total_time + additionalMinutes,
          estimated_arrival: new Date(calc.estimated_arrival.getTime() + additionalMinutes * 60000),
        };

        set((state) => ({
          calculations: { ...state.calculations, [orderId]: updatedCalc },
        }));
      },
    }),
    {
      name: 'eta-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OnboardingState = {
  hasCompletedOnboarding: boolean;
  currentStep: number;
  completeOnboarding: () => void;
  setStep: (step: number) => void;
  resetOnboarding: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      currentStep: 0,
      
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      
      setStep: (step) => set({ currentStep: step }),
      
      resetOnboarding: () => set({ hasCompletedOnboarding: false, currentStep: 0 }),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const onboardingSteps = [
  {
    id: 1,
    title: 'Bienvenido a Catire Hot Dog',
    description: 'La mejor comida rápida de Venezuela al alcance de tu mano.',
    image: '🌭',
    color: '#D32F2F',
  },
  {
    id: 2,
    title: 'Explora el Menú',
    description: 'Descubre nuestra variedad de perros calientes, hamburguesas y más.',
    image: '📋',
    color: '#1976D2',
  },
  {
    id: 3,
    title: 'Haz tu Pedido',
    description: 'Agrega productos al carrito y personaliza tu orden.',
    image: '🛒',
    color: '#388E3C',
  },
  {
    id: 4,
    title: 'Elige tu Método de Pago',
    description: 'Paga con Pago Móvil o en efectivo al recoger.',
    image: '💳',
    color: '#7B1FA2',
  },
  {
    id: 5,
    title: '¡Listo!',
    description: 'Disfruta tu comida y no olvides calificarnos.',
    image: '🎉',
    color: '#F57C00',
  },
];

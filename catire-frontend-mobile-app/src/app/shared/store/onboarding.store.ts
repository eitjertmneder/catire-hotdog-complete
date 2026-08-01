import { create } from 'zustand';

type OnboardingState = {
  hasCompletedOnboarding: boolean;
  currentStep: number;
  completeOnboarding: () => void;
  setStep: (step: number) => void;
  resetOnboarding: () => void;
};

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  hasCompletedOnboarding: false,
  currentStep: 0,

  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
  setStep: (step) => set({ currentStep: step }),
  resetOnboarding: () => set({ hasCompletedOnboarding: false, currentStep: 0 }),
}));

export const onboardingSteps = [
  {
    id: 1,
    title: 'Bienvenido a Catire Hot Dog',
    description: 'La mejor comida rapida de Venezuela al alcance de tu mano.',
    image: 'CATIRE',
    color: '#EC3137',
    textColor: '#FFFFFF',
    subtitleColor: 'rgba(255,255,255,0.9)',
  },
  {
    id: 2,
    title: 'Explora el Menu',
    description: 'Descubre nuestra variedad de perros calientes, hamburguesas y mas.',
    image: 'MENU',
    color: '#FFC107',
    textColor: '#1A1A2E',
    subtitleColor: 'rgba(26,26,46,0.8)',
  },
  {
    id: 3,
    title: 'Haz tu Pedido',
    description: 'Agrega productos al carrito y personaliza tu orden.',
    image: 'PEDIDO',
    color: '#C62828',
    textColor: '#FFFFFF',
    subtitleColor: 'rgba(255,255,255,0.9)',
  },
  {
    id: 4,
    title: 'Elige tu Metodo de Pago',
    description: 'Paga con Pago Movil o en efectivo al recoger.',
    image: 'PAGO',
    color: '#FFD700',
    textColor: '#1A1A2E',
    subtitleColor: 'rgba(26,26,46,0.8)',
  },
  {
    id: 5,
    title: 'Listo!',
    description: 'Disfruta tu comida y no olvides calificarnos.',
    image: 'OK!',
    color: '#EC3137',
    textColor: '#FFFFFF',
    subtitleColor: 'rgba(255,255,255,0.9)',
  },
];

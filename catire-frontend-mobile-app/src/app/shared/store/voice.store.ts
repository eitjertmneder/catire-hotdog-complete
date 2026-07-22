import { create } from 'zustand';
// expo-speech would be imported here if available

type VoiceState = {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  setTranscript: (text: string) => void;
  speak: (text: string) => void;
  parseOrder: (text: string) => { product: string; quantity: number } | null;
};

export const useVoiceStore = create<VoiceState>((set, get) => ({
  isListening: false,
  transcript: '',

  startListening: () => set({ isListening: true }),
  stopListening: () => set({ isListening: false }),
  setTranscript: (text) => set({ transcript: text }),

  speak: (text) => {
    // Speech.speak(text) would be called here
  },

  parseOrder: (text) => {
    const lowerText = text.toLowerCase();
    
    // Common food items
    const products: Record<string, string[]> = {
      'perro normal': ['perro', 'hot dog', 'perro caliente', 'perro normal'],
      'perro mini': ['perro mini', 'hot dog mini', 'mini'],
      'hamburguesa sencilla': ['hamburguesa', 'hamburguesa sencilla', 'hamburgesa'],
      'hamburguesa mixta': ['hamburguesa mixta', 'mixta'],
      'salchipapa junior': ['salchipapa junior', 'salchi junior', 'junior'],
      'salchipapa normal': ['salchipapa', 'salchipapa normal', 'salchi'],
      'coca cola 2l': ['coca', 'coca cola 2', 'coca 2 litros'],
      'coca cola 1l': ['coca 1', 'coca cola 1 litro'],
      'agua': ['agua', 'agua mineral'],
    };

    // Quantity patterns
    const quantityPatterns = [
      /(\d+)\s*(perro|hamburguesa|salchipapa|coca|agua)/i,
      /(?:un|una|uno)\s*(perro|hamburguesa|salchipapa|coca|agua)/i,
      /(?:dos|2)\s*(perro|hamburguesa|salchipapa|coca|agua)/i,
      /(?:tres|3)\s*(perro|hamburguesa|salchipapa|coca|agua)/i,
    ];

    let quantity = 1;
    let foundProduct = null;

    // Check for quantity
    const quantityMatch = lowerText.match(/(\d+|un|una|uno|dos|tres)/);
    if (quantityMatch) {
      const qty = quantityMatch[1];
      if (qty === 'un' || qty === 'una' || qty === 'uno') quantity = 1;
      else if (qty === 'dos') quantity = 2;
      else if (qty === 'tres') quantity = 3;
      else quantity = parseInt(qty) || 1;
    }

    // Check for product
    for (const [product, keywords] of Object.entries(products)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          foundProduct = product;
          break;
        }
      }
      if (foundProduct) break;
    }

    if (foundProduct) {
      return { product: foundProduct, quantity };
    }

    return null;
  },
}));


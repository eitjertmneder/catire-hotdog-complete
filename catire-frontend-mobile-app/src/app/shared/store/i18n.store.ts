import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'es' | 'en' | 'pt';

export const translations = {
  es: {
    // General
    app_name: 'Catire Hot Dog',
    welcome: 'Bienvenido',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    confirm: 'Confirmar',
    back: 'Volver',
    
    // Navigation
    home: 'Inicio',
    menu: 'Menú',
    cart: 'Carrito',
    orders: 'Mis Pedidos',
    profile: 'Mi Perfil',
    settings: 'Configuración',
    
    // Auth
    login: 'Iniciar Sesión',
    logout: 'Cerrar Sesión',
    register: 'Registrarse',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    forgot_password: '¿Olvidaste tu contraseña?',
    
    // Menu
    categories: 'Categorías',
    products: 'Productos',
    add_to_cart: 'Agregar al Carrito',
    view_cart: 'Ver Carrito',
    
    // Cart
    your_cart: 'Tu Carrito',
    empty_cart: 'Tu carrito está vacío',
    total: 'Total',
    checkout: 'Pagar',
    delivery: 'Delivery',
    pickup: 'Recoger en Local',
    
    // Orders
    order_history: 'Historial de Pedidos',
    order_status: 'Estado del Pedido',
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    ready: 'Listo',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    
    // Profile
    my_account: 'Mi Cuenta',
    edit_profile: 'Editar Perfil',
    my_points: 'Mis Puntos',
    my_favorites: 'Mis Favoritos',
    
    // Settings
    language: 'Idioma',
    theme: 'Tema',
    dark_mode: 'Modo Oscuro',
    notifications: 'Notificaciones',
    
    // Voice
    voice_order: 'Pedido por Voz',
    tap_to_speak: 'Toca para hablar',
    listening: 'Escuchando...',
    
    // Reviews
    rate_order: 'Calificar Pedido',
    your_review: 'Tu Reseña',
    submit_review: 'Enviar Reseña',
    
    // Promotions
    promo_code: 'Código de Promoción',
    apply_promo: 'Aplicar',
    discount: 'Descuento',
    
    // Loyalty
    your_points: 'Tus Puntos',
    level: 'Nivel',
    redeem_points: 'Canjear Puntos',
  },
  
  en: {
    // General
    app_name: 'Catire Hot Dog',
    welcome: 'Welcome',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    confirm: 'Confirm',
    back: 'Back',
    
    // Navigation
    home: 'Home',
    menu: 'Menu',
    cart: 'Cart',
    orders: 'My Orders',
    profile: 'My Profile',
    settings: 'Settings',
    
    // Auth
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    forgot_password: 'Forgot password?',
    
    // Menu
    categories: 'Categories',
    products: 'Products',
    add_to_cart: 'Add to Cart',
    view_cart: 'View Cart',
    
    // Cart
    your_cart: 'Your Cart',
    empty_cart: 'Your cart is empty',
    total: 'Total',
    checkout: 'Checkout',
    delivery: 'Delivery',
    pickup: 'Pickup',
    
    // Orders
    order_history: 'Order History',
    order_status: 'Order Status',
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    
    // Profile
    my_account: 'My Account',
    edit_profile: 'Edit Profile',
    my_points: 'My Points',
    my_favorites: 'My Favorites',
    
    // Settings
    language: 'Language',
    theme: 'Theme',
    dark_mode: 'Dark Mode',
    notifications: 'Notifications',
    
    // Voice
    voice_order: 'Voice Order',
    tap_to_speak: 'Tap to speak',
    listening: 'Listening...',
    
    // Reviews
    rate_order: 'Rate Order',
    your_review: 'Your Review',
    submit_review: 'Submit Review',
    
    // Promotions
    promo_code: 'Promo Code',
    apply_promo: 'Apply',
    discount: 'Discount',
    
    // Loyalty
    your_points: 'Your Points',
    level: 'Level',
    redeem_points: 'Redeem Points',
  },
  
  pt: {
    // General
    app_name: 'Catire Hot Dog',
    welcome: 'Bem-vindo',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    cancel: 'Cancelar',
    save: 'Salvar',
    delete: 'Excluir',
    edit: 'Editar',
    confirm: 'Confirmar',
    back: 'Voltar',
    
    // Navigation
    home: 'Início',
    menu: 'Cardápio',
    cart: 'Carrinho',
    orders: 'Meus Pedidos',
    profile: 'Meu Perfil',
    settings: 'Configurações',
    
    // Auth
    login: 'Entrar',
    logout: 'Sair',
    register: 'Cadastrar',
    email: 'E-mail',
    password: 'Senha',
    forgot_password: 'Esqueceu a senha?',
    
    // Menu
    categories: 'Categorias',
    products: 'Produtos',
    add_to_cart: 'Adicionar ao Carrinho',
    view_cart: 'Ver Carrinho',
    
    // Cart
    your_cart: 'Seu Carrinho',
    empty_cart: 'Seu carrinho está vazio',
    total: 'Total',
    checkout: 'Finalizar',
    delivery: 'Entrega',
    pickup: 'Retirada',
    
    // Orders
    order_history: 'Histórico de Pedidos',
    order_status: 'Status do Pedido',
    pending: 'Pendente',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    ready: 'Pronto',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
    
    // Profile
    my_account: 'Minha Conta',
    edit_profile: 'Editar Perfil',
    my_points: 'Meus Pontos',
    my_favorites: 'Meus Favoritos',
    
    // Settings
    language: 'Idioma',
    theme: 'Tema',
    dark_mode: 'Modo Escuro',
    notifications: 'Notificações',
    
    // Voice
    voice_order: 'Pedido por Voz',
    tap_to_speak: 'Toque para falar',
    listening: 'Ouvindo...',
    
    // Reviews
    rate_order: 'Avaliar Pedido',
    your_review: 'Sua Avaliação',
    submit_review: 'Enviar Avaliação',
    
    // Promotions
    promo_code: 'Código Promocional',
    apply_promo: 'Aplicar',
    discount: 'Desconto',
    
    // Loyalty
    your_points: 'Seus Pontos',
    level: 'Nível',
    redeem_points: 'Resgatar Pontos',
  },
};

type I18nState = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      language: 'es',
      
      setLanguage: (lang) => set({ language: lang }),
      
      t: (key) => {
        const { language } = get();
        const keys = key.split('.');
        let value: any = translations[language];
        
        for (const k of keys) {
          value = value?.[k];
        }
        
        return value || key;
      },
    }),
    {
      name: 'i18n-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

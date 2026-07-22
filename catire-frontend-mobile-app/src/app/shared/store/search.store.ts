import { create } from 'zustand';

type SearchCategory = 'products' | 'orders' | 'ingredients' | 'users';

interface SearchResult {
  id: string | number;
  type: SearchCategory;
  title: string;
  subtitle: string;
  data: any;
}

type SearchState = {
  query: string;
  results: SearchResult[];
  recentSearches: string[];
  setQuery: (query: string) => void;
  search: (data: any[], category: SearchCategory) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  clearResults: () => void;
};

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  recentSearches: [],

  setQuery: (query) => set({ query }),

  search: (data, category) => {
    const { query } = get();
    if (!query.trim()) {
      set({ results: [] });
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    data.forEach((item: any) => {
      let matches = false;
      let title = '';
      let subtitle = '';

      switch (category) {
        case 'products':
          matches = item.name?.toLowerCase().includes(lowerQuery) ||
                   item.category?.name?.toLowerCase().includes(lowerQuery);
          title = item.name;
          subtitle = `$${item.base_price} - ${item.category?.name || ''}`;
          break;
        case 'orders':
          matches = item.id?.toString().includes(lowerQuery) ||
                   item.status?.toLowerCase().includes(lowerQuery);
          title = `Pedido #${item.id?.slice(0, 8)}`;
          subtitle = `${item.status} - ${item.is_delivery ? 'Delivery' : 'Local'}`;
          break;
        case 'ingredients':
          matches = item.name?.toLowerCase().includes(lowerQuery) ||
                   item.category?.toLowerCase().includes(lowerQuery);
          title = item.name;
          subtitle = `Stock: ${item.stock} - ${item.category}`;
          break;
        case 'users':
          matches = item.full_name?.toLowerCase().includes(lowerQuery) ||
                   item.email?.toLowerCase().includes(lowerQuery);
          title = item.full_name;
          subtitle = item.email;
          break;
      }

      if (matches) {
        results.push({
          id: item.id,
          type: category,
          title,
          subtitle,
          data: item,
        });
      }
    });

    set({ results });
  },

  addRecentSearch: (query) => {
    set((state) => ({
      recentSearches: [query, ...state.recentSearches.filter(s => s !== query)].slice(0, 10),
    }));
  },

  clearRecentSearches: () => set({ recentSearches: [] }),

  clearResults: () => set({ results: [], query: '' }),
}));

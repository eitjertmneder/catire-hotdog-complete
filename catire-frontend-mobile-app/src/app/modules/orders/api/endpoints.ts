export type OrderEndpoints =
  | 'orders'
  | 'orders/report'
  | `orders/reports/daily?date=${string}`
  | 'reviews'
  | `reviews/${string}`
  | `reviews/order/${string}`
  | 'reviews/my'
  | 'reviews/stats'
  | 'audit'
  | `audit?limit=${string}`
  | `audit?type=${string}`
  | 'audit/stats';
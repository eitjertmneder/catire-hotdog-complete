import { AuthEndpoints } from "../../modules/auth/api/endpoints";
import { CatalogEndpoints } from "../../modules/catalog/api/endpoints";
import { FinanceEndpoints } from "../../modules/finance/api/endpoints";
import { OrderEndpoints } from "../../modules/orders/api/endpoints";

export type Services = 'auth' | 'catalog' | 'orders' | 'finance';

export type Endpoint = AuthEndpoints | CatalogEndpoints | OrderEndpoints | FinanceEndpoints
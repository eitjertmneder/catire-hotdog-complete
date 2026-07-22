import { Api } from '../../../shared/api/api';
import { ApiResponse } from '../../../shared/api/models';
import { Purchase, PurchaseDTO, CurrencyRate } from '../models/Purchase';

const client = new Api();

// ==========================================
// 1. PURCHASES CRUD
// ==========================================
const getPurchases = async (token: string): Promise<ApiResponse<Purchase[]>> => {
  return await client.get<Purchase[]>('finance', 'purchases', token);
};

const createPurchase = async (token: string, payload: PurchaseDTO): Promise<ApiResponse<Purchase>> => {
  return await client.post<PurchaseDTO, Purchase>('finance', 'purchases', payload, token);
};

const updatePurchase = async (token: string, id: string | number, payload: Partial<Purchase>): Promise<ApiResponse<Purchase>> => {
  return await client.patch<Partial<Purchase>, Purchase>('finance', `purchases/${id}` as any, payload, token);
};

const deletePurchase = async (token: string, id: string | number): Promise<ApiResponse<{ success: boolean }>> => {
  return await client.delete<{ success: boolean }>('finance', `purchases/${id}` as any, token);
};

// ==========================================
// 2. CURRENCY RATES
// ==========================================
const getCurrencyRates = async (): Promise<ApiResponse<CurrencyRate>> => {
  return await client.get<CurrencyRate>('finance', 'currency-rates', '');
};

const updateCurrencyRates = async (token: string, data: { rate_cop: number; rate_bs: number }): Promise<ApiResponse<CurrencyRate>> => {
  return await client.patch<any, CurrencyRate>('finance', 'currency-rates', data, token);
};

// ==========================================
// 3. PAYMENT CONFIG
// ==========================================
const getActivePaymentConfig = async (): Promise<ApiResponse<any>> => {
  return await client.get<any>('finance', 'payment-config/active', '');
};

const getAllPaymentConfigs = async (token: string): Promise<ApiResponse<any[]>> => {
  return await client.get<any[]>('finance', 'payment-config', token);
};

const createPaymentConfig = async (token: string, data: { holder_name: string; holder_dni: string; phone: string; bank: string }): Promise<ApiResponse<any>> => {
  return await client.post<any, any>('finance', 'payment-config', data, token);
};

const updatePaymentConfig = async (token: string, id: string, data: Partial<any>): Promise<ApiResponse<any>> => {
  return await client.patch<any, any>('finance', `payment-config/${id}` as any, data, token);
};

export default {
  getPurchases, createPurchase, updatePurchase, deletePurchase,
  getCurrencyRates, updateCurrencyRates,
  getActivePaymentConfig, getAllPaymentConfigs, createPaymentConfig, updatePaymentConfig,
};

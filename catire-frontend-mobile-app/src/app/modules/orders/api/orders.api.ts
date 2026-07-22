import { Api } from '../../../shared/api/api';
import { ApiResponse } from '../../../shared/api/models';
import { Order, OrderDTO } from '../models/Order';

const client = new Api();

const getOrders = async (token: string): Promise<ApiResponse<Order[]>> => {
  return await client.get<Order[]>('orders', 'orders', token);
};

const createOrder = async (token: string, payload: OrderDTO): Promise<ApiResponse<Order>> => {
  return await client.post<OrderDTO, Order>('orders', 'orders', payload, token);
};

const updateOrder = async (token: string, id: string | number, payload: Partial<Order>): Promise<ApiResponse<Order>> => {
  return await client.patch<Partial<Order>, Order>('orders', `orders/${id}` as any, payload, token);
};

const deleteOrder = async (token: string, id: string | number): Promise<ApiResponse<{ success: boolean }>> => {
  return await client.delete<{ success: boolean }>('orders', `orders/${id}` as any, token);
};

export default {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder
};
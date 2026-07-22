import { Api } from '../../../shared/api/api';
import { ApiResponse } from '../../../shared/api/models';
import { Branch, BranchDTO } from '../models/Branch';
import { Menu, MenuDTO } from '../models/Menu';
import { Product, ProductDTO } from '../models/Product';

const client = new Api();

const getBranches = async (token: string): Promise<ApiResponse<Branch[]>> => {
  return await client.get<Branch[]>('catalog', 'branches', token);
}

const createBranch = async (token: string, payload: BranchDTO): Promise<ApiResponse<Branch>> => {
  return await client.post<BranchDTO, Branch>('catalog', 'branches', payload, token);
}

const updateBranch = async (token: string, id: string | number, payload: Partial<Branch>): Promise<ApiResponse<Branch>> => {
  return await client.patch<Partial<Branch>, Branch>('catalog', `branches/${id}` as any, payload, token);
}

const deleteBranch = async (token: string, id: string | number): Promise<ApiResponse<{ success: boolean }>> => {
  return await client.delete<{ success: boolean }>('catalog', `branches/${id}` as any, token);
}

const getMenus = async (token: string, branchId?: string): Promise<ApiResponse<Menu[]>> => {
  return await client.get<Menu[]>('catalog', 'menus', token, branchId);
}

const createMenu = async (token: string, payload: MenuDTO): Promise<ApiResponse<Menu>> => {
  return await client.post<MenuDTO, Menu>('catalog', 'menus', payload, token);
}

const updateMenu = async (token: string, id: string | number, payload: Partial<Menu>): Promise<ApiResponse<Menu>> => {
  return await client.patch<Partial<Menu>, Menu>('catalog', `menus/${id}` as any, payload, token);
}

const deleteMenu = async (token: string, id: string | number): Promise<ApiResponse<{ success: boolean }>> => {
  return await client.delete<{ success: boolean }>('catalog', `menus/${id}` as any, token);
}

const getProducts = async (token: string, menuId?: string): Promise<ApiResponse<Product[]>> => {
  return await client.get<Product[]>('catalog', 'products', token, menuId);
}

const createProduct = async (token: string, payload: ProductDTO): Promise<ApiResponse<Product>> => {
  return await client.post<ProductDTO, Product>('catalog', 'products', payload, token);
}

const updateProduct = async (token: string, id: string | number, payload: Partial<Product>): Promise<ApiResponse<Product>> => {
  return await client.patch<Partial<Product>, Product>('catalog', `products/${id}` as any, payload, token);
}

const deleteProduct = async (token: string, id: string | number): Promise<ApiResponse<{ success: boolean }>> => {
  return await client.delete<{ success: boolean }>('catalog', `products/${id}` as any, token);
}

export default {
  getBranches, getMenus, getProducts,
  createBranch, createMenu, createProduct,
  updateBranch, updateMenu, updateProduct,
  deleteBranch, deleteMenu, deleteProduct
};
import { Api } from '../../../shared/api/api';
import { ApiResponse } from '../../../shared/api/models';
import { User, UserDTO } from '../models/User';

const client = new Api();

const getUsers = async (token: string): Promise<ApiResponse<User[]>> => {
  return await client.get<User[]>('auth', 'users', token);
};

const createUser = async (token: string, payload: UserDTO): Promise<ApiResponse<User>> => {
  return await client.post<UserDTO, User>('auth', 'users', payload, token);
};

const updateUser = async (token: string, id: string | number, payload: Partial<User>): Promise<ApiResponse<User>> => {
  return await client.put<Partial<User>, User>('auth', `users/${id}` as any, payload, token);
};

const deleteUser = async (token: string, id: string | number): Promise<ApiResponse<{ success: boolean }>> => {
  return await client.delete<{ success: boolean }>('auth', `users/${id}` as any, token);
};

export default {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};

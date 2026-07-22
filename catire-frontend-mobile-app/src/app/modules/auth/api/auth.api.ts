import { Api } from '../../../shared/api/api';
import { ApiResponse } from '../../../shared/api/models';
import { AccessTokenDTO, LoginDTO } from '../models/Auth';
import { User, UserDTO } from '../models/User';

const client = new Api();

const login = async (email: string, password: string): Promise<ApiResponse<AccessTokenDTO>> => {
  return await client.post<LoginDTO, AccessTokenDTO>('auth', 'login', {
    email, password
  });
};

const validate = async (token: string): Promise<ApiResponse<User>> => {
  return await client.post<{ token: string }, User>('auth', 'validate', { token });
};

const register = async (payload: UserDTO): Promise<ApiResponse<User>> => {
  return await client.post<UserDTO, User>('auth', 'register', payload);
};

export default { login, validate, register };
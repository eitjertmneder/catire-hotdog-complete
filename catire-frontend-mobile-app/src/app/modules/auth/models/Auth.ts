export interface RefreshToken {
  id: number;
  token: string;
  user_id: number;
  expires_at: Date;
  created_at: Date;
  deleted_at?: Date | null;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AccessTokenDTO {
  access_token: string;
  message: string;
}
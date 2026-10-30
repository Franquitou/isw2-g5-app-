import { api } from '@/api';
import type { LoginRequest, LoginResponse } from '../types';

/** El login es público y no debe adjuntar un token anterior. */
export const authApi = {
  login: (credentials: LoginRequest) => api.post<LoginResponse>('/auth/login', credentials, { auth: false }),
};

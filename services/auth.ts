import { authService } from './authService';
import type { LoginPayload } from '../types/auth';

export async function loginRequest(payload: LoginPayload) {
  return authService.login(payload.email, payload.password);
}

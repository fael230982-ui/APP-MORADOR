import api from './api';

type PasswordRecoveryResponse = {
  message: string;
};

function normalizeMessage(value: unknown, fallback: string) {
  const message = String(value ?? '').trim();
  return message || fallback;
}

export const passwordRecoveryService = {
  async requestReset(email: string): Promise<PasswordRecoveryResponse> {
    const response = await api.post('/api/v1/auth/forgot-password', { email });
    return {
      message: normalizeMessage(
        response.data?.message,
        'Se o e-mail existir, enviaremos as instrucoes para redefinir a senha.'
      ),
    };
  },

  async resetPassword(token: string, password: string): Promise<PasswordRecoveryResponse> {
    const response = await api.post('/api/v1/auth/reset-password', { token, password });
    return {
      message: normalizeMessage(response.data?.message, 'Senha redefinida com sucesso.'),
    };
  },
};

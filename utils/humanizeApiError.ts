type ErrorLike = {
  message?: string;
  request?: unknown;
  response?: {
    status?: number;
    data?: {
      message?: string;
      detail?: string;
    };
  };
};

type HumanizeOptions = {
  fallback: string;
  invalidCredentials?: string;
  unauthorized?: string;
  forbidden?: string;
  notFound?: string;
};

export function humanizeApiError(error: ErrorLike, options: HumanizeOptions) {
  const status = error?.response?.status;
  const apiMessage = error?.response?.data?.message || error?.response?.data?.detail;

  if (status === 401 && options.invalidCredentials) return options.invalidCredentials;
  if (status === 401 && options.unauthorized) return options.unauthorized;
  if (status === 403 && options.forbidden) return options.forbidden;
  if (status === 404 && options.notFound) return options.notFound;

  if (status === 502 || status === 503 || status === 504) {
    return 'O servidor está indisponível no momento. Tente novamente em instantes.';
  }

  if (error?.request) {
    return 'Não foi possível conectar agora. Confira sua internet e tente novamente.';
  }

  if (typeof apiMessage === 'string' && apiMessage.trim()) {
    return apiMessage.trim();
  }

  return options.fallback;
}

import { useCallback, useState } from 'react';
import { hapticFeedback } from '../services/haptics';

function getApiErrorMessage(err: any) {
  const status = err?.response?.status;

  if (status === 401) return 'Sua sessao expirou. Entre novamente para continuar.';
  if (status === 403) return 'Sua conta ainda nao tem acesso a esta area.';
  if (status === 404) return 'Este recurso ainda nao esta disponivel para a sua conta.';
  if (status === 503) return 'O servico esta indisponivel agora. Tente novamente em instantes.';

  return (
    err?.response?.data?.message ||
    (err?.request
      ? 'Nao foi possivel conectar ao backend. Confira a URL da API e a rede.'
      : 'Erro de conexao com o servidor.')
  );
}

export function useApi<T>(apiFunc: (...args: any[]) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunc(...args);
        setData(result);
        return result;
      } catch (err: any) {
        setError(getApiErrorMessage(err));
        hapticFeedback.error();
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc]
  );

  return { data, loading, error, execute };
}

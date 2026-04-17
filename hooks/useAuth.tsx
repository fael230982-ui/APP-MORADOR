import { authService } from '../services/authService';
import { appDiagnostics } from '../services/appDiagnostics';
import { facialStatusService } from '../services/facialStatus';
import { getResidentAppConfig } from '../services/residentAppConfig';
import { legalAcceptanceService } from '../services/legalAcceptance';
import { residentLgpdPolicyService } from '../services/residentLgpdPolicy';
import { residentProfileService } from '../services/residentProfile';
import { useAuthStore } from '../store/useAuthStore';
import { canUseResidentApp, getRoleLabel } from '../utils/permissionsManager';
import { useApi } from './useApi';

export function useAuth() {
  const {
    user,
    token,
    setAuth,
    updateUser,
    setResidentAppConfig,
    logout,
    hasAcceptedTerms,
    acceptedTermsVersion,
    acceptedTermsAt,
    acceptTerms,
    refreshTermsAcceptance,
    setTermsAcceptance,
    currentTermsVersion,
    setCurrentTermsVersion,
  } = useAuthStore();
  const loginApi = useApi(authService.login);

  async function signIn(payload: { email: string; password: string }) {
    try {
      const response = await loginApi.execute(payload.email, payload.password);
      const finalUser =
        process.env.EXPO_PUBLIC_USE_MOCKS === 'true'
          ? response.user
          : await residentProfileService.getProfile().catch((error: any) => {
              const message =
                error?.response?.data?.message ||
                'Login autenticado, mas nao foi possivel carregar o perfil canonico do morador.';
              const profileError = new Error(message);
              (profileError as any).code = 'RESIDENT_PROFILE_UNAVAILABLE_AFTER_LOGIN';
              throw profileError;
            });

      if (!canUseResidentApp(finalUser.role)) {
        const error = new Error(
          `O perfil ${getRoleLabel(finalUser.role)} deve acessar pela web ou pelo app da guarita.`
        );
        (error as any).code = 'ROLE_NOT_ALLOWED_IN_RESIDENT_APP';
        throw error;
      }

      await facialStatusService.syncFromUserProfile(finalUser).catch(() => undefined);
      setAuth(finalUser, response.token);
      const appConfig = finalUser.condominiumId
        ? await getResidentAppConfig(finalUser.condominiumId).catch(() => null)
        : null;
      setResidentAppConfig(appConfig);
      const lgpdPolicy = await residentLgpdPolicyService.getCurrentPolicy().catch(() => null);
      if (lgpdPolicy?.currentVersion) {
        setCurrentTermsVersion(lgpdPolicy.currentVersion);
      }
      await refreshTermsAcceptance().catch(() => undefined);
      const remoteAcceptance = await legalAcceptanceService.getCurrentAcceptance().catch(() => null);
      if (remoteAcceptance?.accepted && remoteAcceptance.version) {
        setTermsAcceptance(remoteAcceptance);
      }
      return { ...response, user: finalUser };
    } catch (error) {
      appDiagnostics.trackError('auth.signIn', error, 'Falha no login do morador').catch(() => undefined);
      throw error;
    }
  }

  async function refreshMe() {
    try {
      const me = await residentProfileService.getProfile();
      await facialStatusService.syncFromUserProfile(me).catch(() => undefined);
      updateUser(me);
      const appConfig = me.condominiumId
        ? await getResidentAppConfig(me.condominiumId).catch(() => null)
        : null;
      setResidentAppConfig(appConfig);
      return me;
    } catch (error) {
      appDiagnostics.trackError('auth.refreshMe', error, 'Falha ao atualizar resident/profile').catch(() => undefined);
      throw error;
    }
  }

  async function signOut() {
    try {
      if (token && process.env.EXPO_PUBLIC_USE_MOCKS !== 'true') {
        await authService.logout();
      }
    } finally {
      logout();
    }
  }

  return {
    user,
    token,
    signed: !!token,
    loading: loginApi.loading,
    hasAcceptedTerms,
    acceptedTermsVersion,
    acceptedTermsAt,
    currentTermsVersion,
    signIn,
    refreshMe,
    signOut,
    acceptTerms,
  };
}

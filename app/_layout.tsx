import { Stack, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import ConsentModal from '../components/ConsentModal';
import UnitSelectionModal from '../components/UnitSelectionModal';
import { CURRENT_TERMS_VERSION } from '../constants/legal';
import { registerResidentDevice } from '../services/deviceRegistration';
import { appDiagnostics } from '../services/appDiagnostics';
import { facialStatusService } from '../services/facialStatus';
import { legalAcceptanceService } from '../services/legalAcceptance';
import { runLocalPrivacyMaintenance } from '../services/localDataGovernance';
import { getResidentAppConfig } from '../services/residentAppConfig';
import { residentCapabilitiesService } from '../services/residentCapabilities';
import { residentLgpdPolicyService } from '../services/residentLgpdPolicy';
import { residentRealtimeService } from '../services/residentRealtime';
import { residentProfileService } from '../services/residentProfile';
import { useAuthStore } from '../store/useAuthStore';
import { canUseResidentApp } from '../utils/permissionsManager';
import {
  ensureNotificationChannels,
  setupNotificationHandler,
  setupNotificationRefreshBridge,
} from '../utils/notificationService';

export default function RootLayout() {
  const segments = useSegments();
  const [termsVersionResolved, setTermsVersionResolved] = useState(false);
  const loadStorage = useAuthStore((state) => state.loadStorage);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const selectedUnitId = useAuthStore((state) => state.selectedUnitId);
  const updateUser = useAuthStore((state) => state.updateUser);
  const selectUnit = useAuthStore((state) => state.selectUnit);
  const setResidentAppConfig = useAuthStore((state) => state.setResidentAppConfig);
  const logout = useAuthStore((state) => state.logout);
  const currentTermsVersion = useAuthStore((state) => state.currentTermsVersion);
  const hasAcceptedTerms = useAuthStore((state) => state.hasAcceptedTerms);
  const acceptTerms = useAuthStore((state) => state.acceptTerms);
  const setCurrentTermsVersion = useAuthStore((state) => state.setCurrentTermsVersion);

  async function handleAcceptTerms() {
    const resolvedTermsVersion = currentTermsVersion?.trim() || CURRENT_TERMS_VERSION;
    const acceptedAt = new Date().toISOString();
    acceptTerms();
    await legalAcceptanceService
      .persistCurrentAcceptance({
        version: resolvedTermsVersion,
        acceptedAt,
      })
      .catch(() => undefined);
  }

  useEffect(() => {
    setupNotificationHandler();
    ensureNotificationChannels().catch(() => undefined);
    runLocalPrivacyMaintenance().catch(() => undefined);
    residentLgpdPolicyService
      .getCurrentPolicy()
      .then((policy) => {
        if (policy?.currentVersion) {
          setCurrentTermsVersion(policy.currentVersion);
        } else {
          setCurrentTermsVersion(CURRENT_TERMS_VERSION);
        }
      })
      .catch(() => {
        setCurrentTermsVersion(CURRENT_TERMS_VERSION);
      })
      .finally(() => setTermsVersionResolved(true));
    residentCapabilitiesService.getStreamCapabilities()
      .then((capabilities) => {
        residentRealtimeService.setStreamCapabilitiesLoaded(!!capabilities);
      })
      .catch((error) => {
        residentRealtimeService.setStreamCapabilitiesLoaded(false);
        appDiagnostics.trackError('bootstrap.streamCapabilities', error, 'Falha ao carregar stream-capabilities').catch(() => undefined);
      });
    residentCapabilitiesService.getSyncCapabilities()
      .then((capabilities) => {
        residentRealtimeService.setSyncCapabilities({
          loaded: !!capabilities,
          enabled: capabilities?.enabled === true,
        });
      })
      .catch((error) => {
        residentRealtimeService.setSyncCapabilities({ loaded: false, enabled: false });
        appDiagnostics.trackError('bootstrap.syncCapabilities', error, 'Falha ao carregar sync-capabilities').catch(() => undefined);
      });
    const cleanupNotificationRefresh = setupNotificationRefreshBridge();
    loadStorage();

    return cleanupNotificationRefresh;
  }, [loadStorage, setCurrentTermsVersion]);

  useEffect(() => {
    residentRealtimeService.configure({ token, unitId: selectedUnitId });
    if (!token) return;

    if (user?.role && !canUseResidentApp(user.role)) {
      logout();
      appDiagnostics.trackWarning('session.role', 'Perfil sem permissao para App Morador').catch(() => undefined);
      return;
    }

    residentProfileService.getProfile()
      .then((profile) => {
        if (!canUseResidentApp(profile.role)) {
          logout();
          appDiagnostics.trackWarning('profile.role', 'resident/profile retornou perfil sem permissao para App Morador').catch(() => undefined);
          return;
        }
        facialStatusService.syncFromUserProfile(profile).catch(() => undefined);
        updateUser(profile);
        const resolvedUnitId =
          profile.selectedUnitId ??
          profile.unitId ??
          (profile.unitIds && profile.unitIds.length === 1 ? profile.unitIds[0] : null);
        const resolvedUnitName =
          profile.selectedUnitName ??
          profile.unitName ??
          (profile.unitNames && profile.unitNames.length === 1 ? profile.unitNames[0] : null);
        if (resolvedUnitId) {
          selectUnit(resolvedUnitId, resolvedUnitName);
        }
        getResidentAppConfig(profile.condominiumId)
          .then((config) => setResidentAppConfig(config))
          .catch((error) => {
            setResidentAppConfig(null);
            appDiagnostics.trackError('profile.condominium', error, 'Falha ao carregar resident/condominium').catch(() => undefined);
          });
      })
      .catch((error) => {
        appDiagnostics.trackError('profile.bootstrap', error, 'Falha ao carregar resident/profile no bootstrap').catch(() => undefined);
      });
  }, [logout, selectedUnitId, selectUnit, setResidentAppConfig, token, updateUser, user?.role]);

  useEffect(() => {
    if (!token || !selectedUnitId) return;
    registerResidentDevice().catch((error) => {
      appDiagnostics.trackError('device.registration', error, 'Falha ao registrar dispositivo do morador').catch(() => undefined);
    });
  }, [token, selectedUnitId]);

  const mustSelectUnit = !!token && !!user?.requiresUnitSelection && !selectedUnitId;
  const isAuthRoute = segments[0] === '(auth)' || segments[0] === 'login';
  const shouldShowConsent = !!token && !!user && !hasAcceptedTerms && !isAuthRoute && termsVersionResolved;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="deliveries/[id]" />
        <Stack.Screen name="unit-dashboard" />
        <Stack.Screen name="resident-actions" />
      </Stack>
      <UnitSelectionModal visible={mustSelectUnit} locked />
      <ConsentModal visible={shouldShowConsent} onAccept={() => { void handleAcceptTerms(); }} />
    </>
  );
}

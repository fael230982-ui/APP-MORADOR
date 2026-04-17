import { clearResidentDeviceRegistrationCache } from './deviceRegistration';
import { facialStatusService } from './facialStatus';
import { clearOldNotifications } from '../utils/notificationService';
import { clearResolvedAlertIds, pruneResolvedAlertIds } from './localAlertState';
import { clearNotifiedVisitIds, pruneNotifiedVisitIds } from './visitForecasts';
import { pruneMockPeopleRegistry } from '../utils/peopleRegistry';

export async function runLocalPrivacyMaintenance() {
  await Promise.allSettled([
    clearOldNotifications(30),
    pruneResolvedAlertIds(200),
    pruneNotifiedVisitIds(200),
    pruneMockPeopleRegistry(180),
  ]);
}

export async function clearSensitiveResidentSessionData() {
  await Promise.allSettled([
    facialStatusService.clear(),
    clearResidentDeviceRegistrationCache(),
    clearResolvedAlertIds(),
    clearNotifiedVisitIds(),
  ]);
}

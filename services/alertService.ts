import api from './api';
import { getAlarmsByStatus } from './alarms';
import { markAlertResolvedLocally, markAlertUnreadLocally } from './localAlertState';
import { emitAppRefresh } from '../utils/refreshBus';

export const alertService = {
  list: () => getAlarmsByStatus('ALL'),

  async markAsRead(id: string) {
    const response = await api.patch(`/api/v1/alerts/${id}/status`, { status: 'READ' });
    await markAlertResolvedLocally(id).catch(() => undefined);
    emitAppRefresh('mutation', { topics: ['alerts', 'overview'], source: 'alertService.markAsRead' });
    return response.data;
  },

  async markAsUnread(id: string) {
    const response = await api.patch(`/api/v1/alerts/${id}/status`, { status: 'UNREAD' });
    await markAlertUnreadLocally(id).catch(() => undefined);
    emitAppRefresh('mutation', { topics: ['alerts', 'overview'], source: 'alertService.markAsUnread' });
    return response.data;
  },

  async updateWorkflow(
    id: string,
    workflowStatus: 'NEW' | 'ON_HOLD' | 'RESOLVED',
    resolutionNote?: string
  ) {
    const response = await api.patch(`/api/v1/alerts/${id}/workflow`, {
      workflowStatus,
      ...(resolutionNote ? { resolutionNote } : {}),
    });
    emitAppRefresh('mutation', { topics: ['alerts', 'overview'], source: 'alertService.updateWorkflow' });
    return response.data;
  },
};

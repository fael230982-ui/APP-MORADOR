import api from './api';

type RegisterFacialPayload = {
  personId: string;
  photoUrl: string;
};

export const facialService = {
  async registerTemplate(payload: RegisterFacialPayload) {
    const response = await api.post('/api/v1/facial/register', payload);
    return response.data;
  },
};

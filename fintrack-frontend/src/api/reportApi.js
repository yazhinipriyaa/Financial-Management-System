import api from './axios';

export const downloadReport = (month, year) =>
  api.get('/reports/download', {
    params: { month, year },
    responseType: 'blob',
  });

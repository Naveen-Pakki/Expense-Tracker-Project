import api from './api';

export const getDashboardData = async () => {
  const response = await api.get('/reports/dashboard');
  return response.data;
};

export const getReportData = async () => {
  const response = await api.get('/reports');
  return response.data;
};

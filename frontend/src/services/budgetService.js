import api from './api';

export const getBudgets = async (month, year) => {
  const params = {};
  if (month && year) {
    params.month = month;
    params.year = year;
  }
  const response = await api.get('/budgets', { params });
  return response.data;
};

export const createOrUpdateBudget = async (budgetData) => {
  const response = await api.post('/budgets', budgetData);
  return response.data;
};

export const deleteBudget = async (id) => {
  const response = await api.delete(`/budgets/${id}`);
  return response.data;
};

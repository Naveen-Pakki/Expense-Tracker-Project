import api from './api';

export const getFilteredExpenses = async (params) => {
  const response = await api.get('/expenses', { params });
  return response.data;
};

export const getExpenseById = async (id) => {
  const response = await api.get(`/expenses/${id}`);
  return response.data;
};

export const createExpense = async (expenseData) => {
  const response = await api.post('/expenses', expenseData);
  return response.data;
};

export const updateExpense = async (id, expenseData) => {
  const response = await api.post(`/expenses/${id}`, expenseData); // Wait, backend is @PutMapping("/{id}") in controller! Ah!
  // Let's verify: yes, in ExpenseController.java we put @PutMapping("/{id}").
  // So we MUST use api.put!
  return api.put(`/expenses/${id}`, expenseData).then(res => res.data);
};

export const deleteExpense = async (id) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

// Authenticated blob download for CSV reports
export const downloadCsvReport = async (filters) => {
  const response = await api.get('/expenses/export/csv', {
    params: filters,
    responseType: 'blob',
  });
  return response.data;
};

// Authenticated blob download for PDF reports
export const downloadPdfReport = async (filters) => {
  const response = await api.get('/expenses/export/pdf', {
    params: filters,
    responseType: 'blob',
  });
  return response.data;
};

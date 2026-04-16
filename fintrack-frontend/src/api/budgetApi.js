import api from './axios';

export const getBudgets = (month, year) => api.get('/budgets', { params: { month, year } });
export const createOrUpdateBudget = (data) => api.post('/budgets', data);
export const deleteBudget = (id) => api.delete(`/budgets/${id}`);

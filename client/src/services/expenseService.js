import api from '../lib/api';

const expenseService = {
  createExpense: async (expenseData) => {
    const response = await api.post('/api/expenses', expenseData);
    return response.data;
  },

  getExpensesByTrip: async (tripId) => {
    const response = await api.get(`/api/expenses/${tripId}`);
    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await api.delete(`/api/expenses/${id}`);
    return response.data;
  }
};

export default expenseService;

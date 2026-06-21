import api from '../lib/api';

const aiService = {
  generateItinerary: async (tripId) => {
    const response = await api.post('/api/ai/generate-itinerary', { tripId });
    return response.data;
  },

  getItinerary: async (tripId) => {
    const response = await api.get(`/api/ai/itinerary/${tripId}`);
    return response.data;
  },

  updateItinerary: async (tripId, itineraryData) => {
    const response = await api.put(`/api/ai/itinerary/${tripId}`, itineraryData);
    return response.data;
  },

  chat: async (tripId, message) => {
    const response = await api.post('/api/ai/chat', { tripId, message });
    return response.data;
  },

  getChatHistory: async (tripId) => {
    const response = await api.get(`/api/ai/chat/${tripId}`);
    return response.data;
  },

  replan: async (tripId, prompt) => {
    const response = await api.post('/api/ai/replan', { tripId, prompt });
    return response.data;
  },

  generatePackingList: async (tripId) => {
    const response = await api.post('/api/ai/packing-list', { tripId });
    return response.data;
  },

  getPackingList: async (tripId) => {
    const response = await api.get(`/api/ai/packing-list/${tripId}`);
    return response.data;
  },

  updatePackingList: async (tripId, items) => {
    const response = await api.put(`/api/ai/packing-list/${tripId}`, { items });
    return response.data;
  },

  getLocalRecommendations: async (tripId) => {
    const response = await api.get(`/api/ai/local-recommendations/${tripId}`);
    return response.data;
  }
};

export default aiService;

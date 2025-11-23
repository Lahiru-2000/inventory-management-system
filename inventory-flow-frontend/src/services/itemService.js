import api from './api'

export const itemService = {
  getAll: () => api.get('/items'),
  getActive: () => api.get('/items/active'),
  getLowStock: () => api.get('/items/low-stock'),
  getById: (id) => api.get(`/items/${id}`),
  create: (data) => api.post('/items', data),
  update: (id, data) => api.put(`/items/${id}`, data)
}



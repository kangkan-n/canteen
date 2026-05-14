import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('canteen_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const verifyAccount = (data) => API.post('/auth/verify', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);

// Menu
export const getMenuItems = (params) => API.get('/menu', { params });
export const getMenuItem = (id) => API.get(`/menu/${id}`);
export const createMenuItem = (data) => API.post('/menu', data);
export const updateMenuItem = (id, data) => API.put(`/menu/${id}`, data);
export const deleteMenuItem = (id) => API.delete(`/menu/${id}`);
export const toggleAvailability = (id) => API.patch(`/menu/${id}/availability`);

// Orders
export const placeOrder = (data) => API.post('/orders', data);
export const getMyOrders = (params) => API.get('/orders/my-orders', { params });
export const getAllOrders = (params) => API.get('/orders/all', { params });
export const getOrderStats = () => API.get('/orders/stats');
export const getOrder = (id) => API.get(`/orders/${id}`);
export const updateOrderStatus = (id, data) => API.patch(`/orders/${id}/status`, data);
export const cancelOrder = (id, data) => API.post(`/orders/${id}/cancel`, data);

// Verification
export const getPendingStudents = () => API.get('/verification/pending');
export const getAllStudents = () => API.get('/verification/students');

export default API;

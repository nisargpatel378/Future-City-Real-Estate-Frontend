import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (data) => api.post('/auth/reset-password', data);
export const changePassword = (data) => api.post('/auth/change-password', data);
export const getMe = () => api.get('/auth/me');

// Properties
export const searchProperties = (data) => api.post('/properties/search', data);
export const getFeatured = () => api.get('/properties/featured');
export const getLatest = (count = 8) => api.get(`/properties/latest?count=${count}`);
export const getPropertyBySlug = (slug) => api.get(`/properties/slug/${slug}`);
export const getPropertyById = (id) => api.get(`/properties/${id}`);
export const createProperty = (data) => api.post('/properties', data);
export const updateProperty = (id, data) => api.put(`/properties/${id}`, data);
export const deleteProperty = (id) => api.delete(`/properties/${id}`);
export const toggleStatus = (id) => api.patch(`/properties/${id}/toggle-status`);
export const toggleFeatured = (id) => api.patch(`/properties/${id}/toggle-featured`);
export const addPropertyImage = (id, formData) => api.post(`/properties/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deletePropertyImage = (imageId) => api.delete(`/properties/images/${imageId}`);
export const setThumbnail = (imageId) => api.patch(`/properties/images/${imageId}/thumbnail`);
export const reorderImages = (propertyId, ids) => api.post(`/properties/${propertyId}/images/reorder`, ids);

// Favorites
export const getFavorites = () => api.get('/favorites');
export const toggleFavorite = (propertyId) => api.post(`/favorites/${propertyId}`);

// Inquiries
export const getInquiries = () => api.get('/inquiries');
export const getInquiryById = (id) => api.get(`/inquiries/${id}`);
export const createInquiry = (data) => api.post('/inquiries', data);
export const replyInquiry = (id, data) => api.post(`/inquiries/${id}/reply`, data);
export const closeInquiry = (id) => api.patch(`/inquiries/${id}/close`);

// Notifications
export const getNotifications = () => api.get('/notifications');
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllRead = () => api.patch('/notifications/read-all');

// Users
export const getAllUsers = () => api.get('/users');
export const updateProfile = (data) => api.put('/users/profile', data);
export const toggleUserStatus = (id) => api.patch(`/users/${id}/toggle-status`);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Contact
export const submitContact = (data) => api.post('/contact', data);
export const getContactMessages = () => api.get('/contact');
export const markContactRead = (id) => api.patch(`/contact/${id}/read`);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');

// Amenities
export const getAmenities = () => api.get('/amenities');

export default api;

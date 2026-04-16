import axios from 'axios';
import { getToken, removeToken } from '@/utils/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://calendly-clone-backend-homc.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ─── Request Interceptor: Attach JWT token ───────────────
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor: Handle 401 (expired/invalid token) ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Event Types ──────────────────────────────────────────
export const eventTypeAPI = {
  getAll: () => api.get('/event-types'),
  getById: (id) => api.get(`/event-types/${id}`),
  create: (data) => api.post('/event-types', data),
  update: (id, data) => api.put(`/event-types/${id}`, data),
  delete: (id) => api.delete(`/event-types/${id}`),
};

// ─── Availability ─────────────────────────────────────────
export const availabilityAPI = {
  getAll: () => api.get('/availability'),
  set: (schedules) => api.post('/availability', { schedules }),
};

// ─── Public Booking ───────────────────────────────────────
export const publicAPI = {
  getEvent: (slug) => api.get(`/event/${slug}`),
  getSlots: (slug, date) => api.get(`/event/${slug}/slots`, { params: { date } }),
  book: (data) => api.post('/book', data),
};

// ─── Bookings / Meetings ─────────────────────────────────
export const bookingAPI = {
  getAll: (type = 'upcoming') => api.get('/bookings', { params: { type } }),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
};

// ─── Auth ─────────────────────────────────────────────────
export const authAPI = {
  getMe: () => api.get('/auth/me'),
};

// ─── Profile ──────────────────────────────────────────────
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  removeAvatar: () => api.delete('/profile/avatar'),
};

// ─── Admin ────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  getBookings: (type = 'upcoming') => api.get('/admin/bookings', { params: { type } }),
  getEventTypes: () => api.get('/admin/event-types'),
  cancelBooking: (id) => api.patch(`/admin/bookings/${id}/cancel`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default api;

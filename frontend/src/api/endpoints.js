import api from './axios';

// ── Auth ─────────────────────────────────────────────────────────────────────
export const login = (credentials) => api.post('/api/auth/login', credentials);
export const refreshToken = (token) => api.post('/api/auth/refresh', { refreshToken: token });

// ── Inventory ────────────────────────────────────────────────────────────────
export const searchInventory = (params) => api.get('/api/inventory/search', { params });
export const exportInventory = (keyword = '') =>
  api.get('/api/inventory/export', {
    params: { keyword },
    responseType: 'blob',
  });

// ── Upload ───────────────────────────────────────────────────────────────────
export const uploadExcel = (file, sheetName = '19-05-26', onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/upload/excel', formData, {
    params: { sheetName },
    headers: { 'Content-Type': undefined },
    onUploadProgress,
  });
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboardStats = () => api.get('/api/dashboard/stats');
export const getUploadHistory = (page = 0, size = 10) =>
  api.get('/api/dashboard/upload-history', { params: { page, size } });
export const getLoginHistory = (page = 0, size = 20) =>
  api.get('/api/dashboard/login-history', { params: { page, size } });

// ── Vehicle Images ────────────────────────────────────────────────────────────
export const getVehicleImage = (key) => api.get(`/api/vehicle-images/${encodeURIComponent(key)}`);
export const uploadVehicleImage = (key, imageData) => api.post(`/api/vehicle-images/${encodeURIComponent(key)}`, { imageData });
export const deleteVehicleImage = (key) => api.delete(`/api/vehicle-images/${encodeURIComponent(key)}`);


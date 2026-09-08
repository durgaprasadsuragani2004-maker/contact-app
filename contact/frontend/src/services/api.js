const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://contact-app-1b66.onrender.com';
const API_BASE = `${BACKEND_URL.replace(/\/$/, '')}/api`;

// Helper to get auth header
function getAuthHeaders(isMultipart = false) {
  const token = localStorage.getItem('qrlync_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

// Centralized fetch helper with error handling
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type');

    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const errorMsg = (data && data.message) || data || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Auth
  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  login: (payload) =>
    request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  getMe: () =>
    request('/auth/me', {
      method: 'GET',
      headers: getAuthHeaders()
    }),

  updatePassword: (payload) =>
    request('/auth/update-password', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    }),

  // Profile Management
  getProfile: () =>
    request('/profile', {
      method: 'GET',
      headers: getAuthHeaders()
    }),

  updateProfile: (profileData) =>
    request('/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    }),

  uploadMedia: (formData) =>
    request('/profile/upload', {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData
    }),

  regenerateQR: () =>
    request('/profile/regenerate-qr', {
      method: 'POST',
      headers: getAuthHeaders()
    }),

  updateQrStyle: (payload) =>
    request('/profile/qrcode', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    }),

  getLeads: () =>
    request('/profile/leads', {
      method: 'GET',
      headers: getAuthHeaders()
    }),

  exportLeadsCSV: async () => {
    const token = localStorage.getItem('qrlync_token');
    const res = await fetch(`${API_BASE}/profile/leads/export`, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) {
      throw new Error('Failed to export leads as CSV');
    }
    return await res.blob();
  },

  getAnalytics: (days = 30) =>
    request(`/profile/analytics?days=${days}`, {
      method: 'GET',
      headers: getAuthHeaders()
    }),

  // Public Endpoints
  getPublicProfile: (token) =>
    request(`/public/profile/${token}`, {
      method: 'GET'
    }),

  captureLead: (identifier, payload) =>
    request(`/public/${identifier}/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  getVCardDownloadUrl: (token) => `${API_BASE}/contact/${token}`
};
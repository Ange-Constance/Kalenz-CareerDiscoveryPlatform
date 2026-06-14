import axios from 'axios';

// Use Vite proxy in dev (/api → localhost:3000). Set VITE_API_URL for production.
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('lastAnalysis');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/** Upload CV for ML career analysis */
export async function uploadCV(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/analysis/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });
  return data;
}

/** Career-aware chat */
export async function getChatResponse(message, career, context) {
  const { data } = await api.post('/analysis/chat', { message, career, context });
  return data;
}

/** Analysis history */
export async function getAnalysisHistory() {
  const { data } = await api.get('/analysis/history');
  return data;
}

/** Auth */
export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function register(name, email, password) {
  const parts = name.trim().split(' ');
  const { data } = await api.post('/auth/register', {
    email,
    password,
    firstName: parts[0],
    lastName: parts.slice(1).join(' ') || undefined,
    name,
  });
  return data;
}

// Legacy exports — keep existing dashboard working
export const authAPI = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  githubCallback: (payload) => api.post('/auth/github-callback', payload),
};

export const evidenceAPI = {
  uploadGitHub: (githubUsername) => api.post('/evidence/github', { githubUsername }),
  uploadCertificate: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/evidence/certificate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadCV: (file, text) => {
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (text) formData.append('text', text);
    return api.post('/evidence/cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getEvidence: (userId) => api.get(`/evidence/${userId}`),
};

export const analysisAPI = {
  run: () => api.post('/analysis/run'),
  getById: (id) => api.get(`/analysis/${id}`),
  getHistory: () => api.get('/analysis/history'),
  upload: uploadCV,
  chat: getChatResponse,
};

export const roadmapAPI = {
  get: (careerName) => api.get(`/roadmap/${encodeURIComponent(careerName)}`),
  download: (careerName) =>
    api.post('/roadmap/download', { careerName }, { responseType: 'blob' }),
};

export const chatAPI = {
  sendMessage: (message, context) => api.post('/chat/message', { message, context }),
  getHistory: () => api.get('/chat/history'),
};

export default api;

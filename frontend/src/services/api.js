import axios from 'axios';
import {
  getLastAnalysis,
  setLastAnalysis,
  addToAnalysisHistory,
  normalizeAnalysis,
} from '../utils/lastAnalysis';

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
  // Let axios set multipart boundary automatically — manual Content-Type breaks uploads
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
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
      localStorage.removeItem('analysisHistory');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

function cacheAnalysis(data) {
  if (data) {
    setLastAnalysis(data);
    addToAnalysisHistory(data);
  }
}

/** Upload CV for ML career analysis */
export async function uploadCV(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/analysis/upload', formData, {
    timeout: 120000,
  });
  if (data.success && data.data) cacheAnalysis(data.data);
  return data;
}

/** GitHub-only analysis */
export async function analyzeGitHub(usernameOrUrl) {
  const formData = new FormData();
  formData.append('github', usernameOrUrl);
  const { data } = await api.post('/analysis/upload', formData, {
    timeout: 120000,
  });
  if (data.success && data.data) cacheAnalysis(data.data);
  return data;
}

/** Combined CV / GitHub / certificate analysis */
export async function analyzeCombined({ file, github, certificate }) {
  const formData = new FormData();
  if (file) formData.append('file', file);
  if (github) formData.append('github', github);
  if (certificate) formData.append('certificate', certificate);
  const { data } = await api.post('/analysis/upload', formData, {
    timeout: 120000,
  });
  if (data.success && data.data) cacheAnalysis(data.data);
  return data;
}

/** Generate personalized roadmap */
export async function generateRoadmap(analysisId, career, cvText, confidence, keySkills) {
  const { data } = await api.post('/analysis/roadmap', {
    analysis_id: analysisId,
    career,
    cv_text: cvText,
    confidence,
    key_skills: keySkills,
  });
  return data;
}

/** Latest CV analysis from server */
export async function getLatestAnalysis() {
  const { data } = await api.get('/analysis/latest');
  if (data.success && data.data) cacheAnalysis(data.data);
  return data;
}

/** Single analysis by ID */
export async function getAnalysis(id) {
  const { data } = await api.get(`/analysis/${id}`);
  if (data.success && data.data) cacheAnalysis(data.data);
  return data;
}

/** Chat history for analysis session */
export async function getAnalysisChatHistory(analysisId) {
  const { data } = await api.get(`/analysis/${analysisId}/chat`);
  return data;
}

/** Career-aware chat via ML service */
export async function getChatResponse(message, career, context, options = {}) {
  const { data } = await api.post('/analysis/chat', {
    message,
    career,
    context,
    cv_summary: options.cvSummary,
    analysis_id: options.analysisId,
    chat_history: options.chatHistory,
  });
  return data;
}

/** All CV analyses */
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
  getById: getAnalysis,
  getHistory: getAnalysisHistory,
  getLatest: getLatestAnalysis,
  upload: uploadCV,
  analyzeCombined,
  analyzeGitHub,
  generateRoadmap,
  chat: getChatResponse,
  getChatHistory: getAnalysisChatHistory,
};

export const adminAPI = {
  getMetrics: () => api.get('/admin/metrics').then((r) => r.data),
  getUsers: (page = 1, search = '') =>
    api.get(`/admin/users?page=${page}&search=${encodeURIComponent(search)}`).then((r) => r.data),
  getUser: (id) => api.get(`/admin/users/${id}`).then((r) => r.data),
  getAnalyses: (page = 1, career = '') =>
    api
      .get(`/admin/analyses?page=${page}&career=${encodeURIComponent(career)}`)
      .then((r) => r.data),
};

export const roadmapAPI = {
  get: async (careerName) => {
    const { data } = await api.get(`/roadmap/${encodeURIComponent(careerName)}`);
    return { data: data.data || data };
  },
  download: (careerName) =>
    api.post('/roadmap/download', { careerName }, { responseType: 'blob' }),
};

export const chatAPI = {
  sendMessage: (message, career, context, options) =>
    api.post('/analysis/chat', {
      message,
      career,
      context,
      ...options,
    }),
  getHistory: async () => {
    const { data } = await api.get('/chat/history');
    return data;
  },
};

export { getLastAnalysis, setLastAnalysis, normalizeAnalysis, addToAnalysisHistory };
export default api;

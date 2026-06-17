import axios from 'axios';
import { clearToken, getToken } from './auth';

/** 모든 요청은 상대경로 /api 로 보내고 Next rewrites 가 백엔드로 프록시한다. */
const api = axios.create({ baseURL: '/api', timeout: 5000 });

// 요청 인터셉터: 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 → 토큰 폐기 후 로그인으로
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;

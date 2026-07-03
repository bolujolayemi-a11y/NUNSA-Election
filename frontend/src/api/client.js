import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Attach the correct token based on the endpoint
api.interceptors.request.use((config) => {
  let token = null;
  let tokenType = null;

  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  if (url.startsWith('/master')) {
    token = localStorage.getItem('master_token');
    tokenType = 'master';
  } else if (
    url.startsWith('/positions/admin') ||
    url.startsWith('/votes/results') ||
    url.startsWith('/votes/voters')
  ) {
    token = localStorage.getItem('admin_token');
    tokenType = 'admin';
  } else if (url.startsWith('/positions') && ['post', 'put', 'delete'].includes(method)) {
    token = localStorage.getItem('admin_token');
    tokenType = 'admin';
  } else {
    token = localStorage.getItem('voter_token');
    tokenType = 'voter';
  }

  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['X-Token-Type'] = tokenType;
  return config;
});

// Handle expired/invalid tokens
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const tokenType = err.config?.headers?.['X-Token-Type'];
      switch (tokenType) {
        case 'master':
          localStorage.removeItem('master_token');
          localStorage.removeItem('master_user');
          window.location.href = '/master/login';
          break;
        case 'admin':
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          window.location.href = '/secure-admin';
          break;
        default:
          localStorage.removeItem('voter_token');
          localStorage.removeItem('voter_user');
          window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

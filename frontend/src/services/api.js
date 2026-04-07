const BASE_URL = import.meta.env.VITE_API_URL || '';
const getToken = () => localStorage.getItem('token');

export const api = {
  get: (url) => fetch(`${BASE_URL}${url}`, { headers: { Authorization: `Bearer ${getToken()}` } }).then(r => r.json()),
  post: (url, body) => fetch(`${BASE_URL}${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(body) }).then(r => r.json()),
  put: (url, body) => fetch(`${BASE_URL}${url}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(body) }).then(r => r.json()),
  delete: (url) => fetch(`${BASE_URL}${url}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } }).then(r => r.json()),
  postForm: (url, formData) => fetch(`${BASE_URL}${url}`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: formData }).then(r => r.json()),
};

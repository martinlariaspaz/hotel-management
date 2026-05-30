export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
export const REALTIME_URL = `${API_URL.replace(/\/+$/, '')}/realtime`;

export default API_URL;

import axios from "axios";

// Membuat instance axios
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // <-- SANGAT PENTING untuk Sanctum SPA Auth (cookies)
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Accept": "application/json",
  },
});

// Interceptor untuk menambahkan token ke setiap request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;

// Kita juga buat instance terpisah untuk 'base url' (untuk CSRF)
export const apiBase = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Accept": "application/json",
  },
});
import axios from "axios";
import { getToken, clearToken } from "./auth";

const api = axios.create({
    baseURL: "/api",
    timeout: 15000,
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && getToken()) {
        clearToken();
        window.location.href = "/admin/login";
        }
        return Promise.reject(error);
    }
);

export default api;
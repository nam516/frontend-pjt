import axios from "axios";
import { token } from "../auth/token";

export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
    headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
    const accessToken = token.getAccess();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

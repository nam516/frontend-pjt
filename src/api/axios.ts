// src/api/axios.ts
import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { tokenStore } from "../auth/tokenStore";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
    withCredentials: true,
});

// ====== types ======
type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };

// ====== request interceptor: attach access token ======
api.interceptors.request.use((config) => {
    const token = tokenStore.getAccessToken();
    if (token) {
        config.headers = config.headers ?? {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
});

// ====== response interceptor: 401 -> refresh -> retry ======
let isRefreshing = false;
let queue: Array<(t: string | null) => void> = [];

function isAuthEndpoint(url: string) {
    // 401 처리에서 제외할 엔드포인트들 (무한루프 방지)
    return (
        url.includes("/auth/login") ||
        url.includes("/auth/refresh") ||
        url.includes("/auth/logout")
    );
}

api.interceptors.response.use(
    (res: AxiosResponse) => res,
    async (error: AxiosError) => {
        const status = error.response?.status;
        const original = error.config as RetryableConfig | undefined;

        if (!original || status !== 401) throw error;

        const url = original.url ?? "";
        if (original._retry || isAuthEndpoint(url)) throw error;

        original._retry = true;

        // 이미 refresh 중이면 큐에 쌓았다가 토큰 갱신 후 재시도
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                queue.push((t) => {
                    if (!t) return reject(error);
                    original.headers = original.headers ?? {};
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (original.headers as any).Authorization = `Bearer ${t}`;
                    resolve(api(original));
                });
            });
        }

        isRefreshing = true;

        try {
            // 순환 참조 방지: 여기서 api(axios 인스턴스) 말고 "auth" 모듈의 refresh() 호출
            const { refresh } = await import("./auth");

            const tokenResponse = await refresh(); // 내부에서 refreshToken 꺼내서 /auth/refresh 호출
            const newAccessToken = tokenResponse.accessToken;

            tokenStore.setAccessToken(newAccessToken);

            // 대기 중인 요청들 재개
            queue.forEach((cb) => cb(newAccessToken));
            queue = [];

            // 방금 실패했던 원본 요청도 재시도
            original.headers = original.headers ?? {};
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (original.headers as any).Authorization = `Bearer ${newAccessToken}`;

            return api(original);
        } catch (e) {
            tokenStore.clear();
            queue.forEach((cb) => cb(null));
            queue = [];
            throw e;
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;

// src/api/axios.ts
import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { tokenStore } from "../store/auth";

const api = axios.create({
    baseURL: "",  // 빈값 → Vite 프록시가 /auth, /api 등을 8080으로 중계
    withCredentials: true,
});

type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };

// request: access token 첨부
api.interceptors.request.use((config) => {
    const token = tokenStore.getAccessToken();
    if (token) {
        config.headers = config.headers ?? {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
});

// response: 401 → refresh → retry
let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

function flushQueue(token: string | null) {
    queue.forEach((cb) => cb(token));
    queue = [];
}

function isSkipUrl(url = "") {
    return (
        url.includes("/auth/login") ||
        url.includes("/auth/refresh") ||
        url.includes("/auth/logout")
    );
}

type ApiResponseToken = {
    success: boolean;
    data: {
        accessToken: string;
        refreshToken: string;
    };
};

api.interceptors.response.use(
    (res: AxiosResponse) => res,
    async (error: AxiosError) => {
        const status = error.response?.status;
        const original = error.config as RetryableConfig | undefined;

        if (
            status !== 401 ||
            !original ||
            original._retry ||
            isSkipUrl(original.url)
        ) {
            return Promise.reject(error);
        }

        original._retry = true;

        // 이미 refresh 중 → 큐에 대기
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                queue.push((newToken) => {
                    if (!newToken) return reject(error);
                    original.headers = original.headers ?? {};
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (original.headers as any).Authorization = `Bearer ${newToken}`;
                    resolve(api(original));
                });
            });
        }

        isRefreshing = true;

        try {
            const refreshToken = tokenStore.getRefreshToken();
            if (!refreshToken) throw new Error("No refresh token");

            // api 인스턴스로 호출 → Vite 프록시 정상 통과 (/auth/refresh → 8080)
            // _retry: true 이므로 인터셉터에서 다시 잡히지 않음
            const { data } = await api.post<ApiResponseToken>(
                "/auth/refresh",
                { refreshToken }
            );

            if (!data.success || !data.data?.accessToken) {
                throw new Error("Refresh failed");
            }

            const newAccessToken = data.data.accessToken;
            const newRefreshToken = data.data.refreshToken;

            tokenStore.setAccessToken(newAccessToken);
            tokenStore.setRefreshToken(newRefreshToken);

            flushQueue(newAccessToken);

            original.headers = original.headers ?? {};
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (original.headers as any).Authorization = `Bearer ${newAccessToken}`;
            return api(original);

        } catch (refreshError) {
            tokenStore.clear();
            flushQueue(null);
            window.location.href = "/login";
            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
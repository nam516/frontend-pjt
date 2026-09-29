// src/api/axios.ts
import axios, {
    AxiosError,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from "axios";
import { tokenStore } from "../store/auth";

const api = axios.create({
    baseURL: "",
    withCredentials: true, // ← HttpOnly 쿠키 자동 전송을 위해 필수
});

/**
 * 401 로 한 번 재시도한 요청인지 표시해 둔다. 이 표시가 없으면
 * refresh 도 401 을 받는 순간 무한히 재시도한다.
 *
 * <p>axios 가 인터셉터에 넘겨주는 설정은 {@code InternalAxiosRequestConfig} 라
 * {@code headers} 가 항상 채워져 있는 {@code AxiosHeaders} 다. 그래서 헤더를 넣을 때
 * 캐스팅 없이 {@code headers.set(...)} 을 쓸 수 있다.
 */
type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// request: access token 첨부
api.interceptors.request.use((config) => {
    const token = tokenStore.getAccessToken();
    if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
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

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                queue.push((newToken) => {
                    if (!newToken) return reject(error);
                    original.headers.set("Authorization", `Bearer ${newToken}`);
                    resolve(api(original));
                });
            });
        }

        isRefreshing = true;

        try {
            // refreshToken은 HttpOnly 쿠키로 자동 전송 → body 없이 요청
            const { data } = await api.post<ApiResponseToken>("/auth/refresh");

            if (!data.success || !data.data?.accessToken) {
                throw new Error("Refresh failed");
            }

            const newAccessToken = data.data.accessToken;
            tokenStore.setAccessToken(newAccessToken);

            flushQueue(newAccessToken);

            original.headers.set("Authorization", `Bearer ${newAccessToken}`);
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
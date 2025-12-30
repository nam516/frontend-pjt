import axios from "axios";
import { tokenStore } from "../auth/tokenStore";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
    withCredentials: true, // refreshToken을 쿠키로 쓸 가능성 대비(서버 설정에 맞춤)
});

// 요청: accessToken 자동 첨부
api.interceptors.request.use((config) => {
    const token = tokenStore.getAccessToken();
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 응답: 401이면 refresh 시도 후 재요청
let isRefreshing = false;
let queue: Array<(t: string | null) => void> = [];

api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const original = err.config;
        const status = err.response?.status;

        if (status !== 401 || original?._retry) throw err;
        original._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                queue.push((t) => {
                    if (!t) return reject(err);
                    original.headers.Authorization = `Bearer ${t}`;
                    resolve(api(original));
                });
            });
        }

        isRefreshing = true;
        try {
            // 백엔드에 refresh API가 있다면 여기에 맞춰 호출
            const { refresh } = await import("./auth.api");
            const tokenResponse = await refresh();
            tokenStore.setAccessToken(tokenResponse.accessToken);

            queue.forEach((cb) => cb(tokenResponse.accessToken));
            queue = [];

            original.headers.Authorization = `Bearer ${tokenResponse.accessToken}`;
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

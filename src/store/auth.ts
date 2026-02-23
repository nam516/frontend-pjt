// src/store/auth.ts
const ACCESS_KEY = "accessToken";

export const tokenStore = {
    getAccessToken(): string | null {
        return localStorage.getItem(ACCESS_KEY);
    },
    setAccessToken(token: string) {
        localStorage.setItem(ACCESS_KEY, token);
    },
    clearAccessToken() {
        localStorage.removeItem(ACCESS_KEY);
    },
    // 하위 호환성 유지 (기존 코드에서 혹시 호출하는 경우 대비)
    clear() {
        localStorage.removeItem(ACCESS_KEY);
    },
};
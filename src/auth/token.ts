const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export const token = {
    getAccess(): string | null {
        return localStorage.getItem(ACCESS_KEY);
    },
    getRefresh(): string | null {
        return localStorage.getItem(REFRESH_KEY);
    },
    set(accessToken: string, refreshToken?: string) {
        localStorage.setItem(ACCESS_KEY, accessToken);
        if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    },
    clear() {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
    },
};

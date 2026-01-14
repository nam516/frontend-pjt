import api from "./axios";
import { tokenStore } from "../auth/tokenStore";

export type LoginRequest = {
    loginId: string;
    password: string;
};

export type TokenResponse = {
    accessToken: string;
    refreshToken: string;
    userId?: number;
    role?: string;
};

export type RefreshRequest = {
    refreshToken: string;
};

export type MeResponse =
    | { authenticated: false }
    | { authenticated: true; userId: number };

export async function login(req: LoginRequest): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>("/auth/login", req);

    tokenStore.setAccessToken(res.data.accessToken);
    tokenStore.setRefreshToken(res.data.refreshToken);

    return res.data;
}

export async function me(): Promise<MeResponse> {
    const res = await api.get<MeResponse>("/api/me");
    return res.data;
}

export async function logout(): Promise<void> {
    const refreshToken = tokenStore.getRefreshToken();

    try {
        if (refreshToken) {
            await api.post("/auth/logout", { refreshToken });
        }
    } finally {
        tokenStore.clear();
    }
}

export async function refresh(): Promise<TokenResponse> {
    const refreshToken = tokenStore.getRefreshToken();

    if (!refreshToken) {
        throw new Error("Refresh token is missing");
    }

    const res = await api.post<TokenResponse>(
        "/auth/refresh",
        { refreshToken } satisfies RefreshRequest
    );

    // refresh 시에는 보통 accessToken + refreshToken 둘 다 갱신됨
    tokenStore.setAccessToken(res.data.accessToken);
    tokenStore.setRefreshToken(res.data.refreshToken);

    return res.data;
}

import api from "./axios";

export type LoginRequest = {
    loginId: string;
    password: string;
};

export type TokenResponse = {
    accessToken: string;
    refreshToken?: string; // 서버가 바디로 주면 받기(쿠키면 없어도 됨)
    tokenType?: string;    // optional
    expiresIn?: number;    // optional
};

export async function login(req: LoginRequest): Promise<TokenResponse> {
    // 너의 AuthController 경로에 맞추기 (예: /auth/login)
    const { data } = await api.post<TokenResponse>("/auth/login", req);
    return data;
}

export async function refresh(): Promise<TokenResponse> {
    // 예: /auth/refresh
    const { data } = await api.post<TokenResponse>("/auth/refresh");
    return data;
}

export async function logout(): Promise<void> {
    // 예: /auth/logout
    await api.post("/auth/logout");
}

import { api } from "./client";

/**
 * 로그인 요청 타입
 */
export type LoginRequest = {
    loginId: string;
    password: string;
};

/**
 * 로그인 응답 타입
 */
export type LoginResponse = {
    accessToken: string;
    refreshToken: string;
};

/**
 * 로그인 API 호출
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", request);
    return response.data;
}

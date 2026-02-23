// src/api/auth.ts
import api from "./axios";
import { tokenStore } from "../store/auth";

export type LoginRequest = {
    loginId: string;
    password: string;
};

export type TokenResponse = {
    accessToken: string;
    // refreshToken은 HttpOnly 쿠키로 전달 → body에 없음
    userId?: number;
    role?: string;
};

export type MeResponse =
    | { authenticated: false }
    | { authenticated: true; userId: number; role: string };

// 백엔드 응답 래퍼 타입
type ApiResponse<T> = {
    success: boolean;
    data: T;
    error: { code: string; messageKey: string } | null;
};

/** ApiResponse에서 에러 메시지를 string으로 안전하게 추출 */
export function extractApiErrorMsg(err: unknown, fallback = "요청에 실패했어요."): string {
    if (!err || typeof err !== "object") return fallback;
    if (err instanceof Error) return err.message;

    const e = err as Record<string, unknown>;
    const data = (e?.response as Record<string, unknown>)?.data as
        | Record<string, unknown>
        | undefined;

    const apiErr = data?.error as Record<string, unknown> | undefined;
    if (typeof apiErr?.messageKey === "string") return apiErr.messageKey;
    if (typeof apiErr?.code === "string") return `오류 코드: ${apiErr.code}`;

    if (typeof data?.message === "string") return data.message;

    return fallback;
}

export async function login(req: LoginRequest): Promise<TokenResponse> {
    const res = await api.post<ApiResponse<TokenResponse>>("/auth/login", req);

    if (!res.data.success || !res.data.data) {
        const errCode = res.data.error;
        throw new Error(errCode?.messageKey ?? "로그인에 실패했어요.");
    }

    const token = res.data.data;

    // accessToken만 저장 (refreshToken은 HttpOnly 쿠키로 자동 관리)
    tokenStore.setAccessToken(token.accessToken);

    return token;
}

export async function me(): Promise<MeResponse> {
    const res = await api.get<ApiResponse<MeResponse>>("/api/me");

    if (!res.data.success || !res.data.data) {
        throw new Error("인증 정보를 가져올 수 없어요.");
    }

    return res.data.data;
}

export async function logout(): Promise<void> {
    try {
        await api.post("/auth/logout");
    } finally {
        // accessToken만 삭제 (refreshToken 쿠키는 서버에서 삭제)
        tokenStore.clearAccessToken();
    }
}

export async function refresh(): Promise<TokenResponse> {
    // refreshToken은 쿠키에 있으므로 body 없이 요청
    // withCredentials: true → 쿠키 자동 전송
    const res = await api.post<ApiResponse<TokenResponse>>("/auth/refresh");

    if (!res.data.success || !res.data.data) {
        throw new Error("Token refresh failed");
    }

    const token = res.data.data;
    tokenStore.setAccessToken(token.accessToken);

    return token;
}
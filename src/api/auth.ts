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

/**
 * 서버 응답에서 사람이 읽을 메시지를 뽑아낸다.
 *
 * 주의: AxiosError 도 Error 의 인스턴스라서 err.message 를 먼저 반환하면
 * "Request failed with status code 400" 만 나오고 응답 본문을 못 읽는다.
 * 그래서 응답 본문을 먼저 확인하고, 마지막에만 err.message 로 떨어진다.
 */
export function extractApiErrorMsg(err: unknown, fallback = "요청에 실패했어요."): string {
    if (!err || typeof err !== "object") return fallback;

    const e = err as Record<string, unknown>;
    const data = (e.response as Record<string, unknown> | undefined)?.data as
        | Record<string, unknown>
        | undefined;
    const apiErr = data?.error as Record<string, unknown> | undefined;

    // 입력값 검증 실패면 어떤 필드가 왜 틀렸는지 먼저 보여준다
    const fieldErrors = apiErr?.fieldErrors as
        | Array<{ field?: string; message?: string }>
        | undefined;
    if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        return fieldErrors.map((f) => `${f.field} : ${f.message}`).join("\n");
    }

    if (typeof apiErr?.messageKey === "string") return apiErr.messageKey;
    if (typeof apiErr?.code === "string") return `오류 코드: ${apiErr.code}`;
    if (typeof data?.message === "string") return data.message;

    if (err instanceof Error && err.message) return err.message;
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
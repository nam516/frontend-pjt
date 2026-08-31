// src/api/common.ts

/** 백엔드 공통 응답 래퍼 (ApiResponse<T>) */
export type ApiResponse<T> = {
    success: boolean;
    data: T;
    error: { code: string; messageKey: string } | null;
};

/**
 * 공통 응답에서 data 만 꺼낸다.
 * success 가 false 면 messageKey 를 담아 예외를 던진다.
 */
export function unwrap<T>(res: { data: ApiResponse<T> }): T {
    if (!res.data?.success) {
        throw new Error(res.data?.error?.messageKey ?? "요청에 실패했어요.");
    }
    return res.data.data;
}

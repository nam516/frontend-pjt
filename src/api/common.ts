// src/api/common.ts
import { extractApiErrorMsg } from "./auth";

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

/**
 * 서버가 내려준 오류 코드(예: "P007")만 뽑는다. 없으면 null.
 *
 * <p>지금 서버는 사람이 읽을 문장이 아니라 <b>메시지 키</b>를 내려보낸다
 * (`"error.member.last_owner"`). 그래서 문장은 화면이 코드를 보고 정한다.
 */
export function extractApiErrorCode(err: unknown): string | null {
    if (!err || typeof err !== "object") return null;

    const data = (err as Record<string, unknown>).response as
        | Record<string, unknown>
        | undefined;
    const body = data?.data as Record<string, unknown> | undefined;
    const apiErr = body?.error as Record<string, unknown> | undefined;

    return typeof apiErr?.code === "string" ? apiErr.code : null;
}

/**
 * 사람이 읽을 문장이 아닌 것을 걸러내는 데 쓴다.
 * 메시지 키(`error.member.last_owner`), 코드만 있는 문구, axios 의 영어 기본 문구.
 */
const RAW_MESSAGE = /^(error\.|오류 코드:|Request failed)/;

/**
 * 화면마다 따로 적을 필요가 없는 공통 오류.
 * 화면이 넘긴 표가 이것보다 우선한다.
 */
const COMMON_ERROR_MESSAGES: Record<string, string> = {
    C001: "보낸 값의 형식이 올바르지 않아요. 입력한 내용을 확인해 주세요.",
    C002: "입력값을 확인해 주세요.",
    A002: "로그인이 필요해요.",
    A003: "권한이 없어요.",
    A004: "로그인이 만료됐어요. 다시 로그인해 주세요.",
    N002: "요청한 자료를 찾을 수 없어요.",
    E001: "서버에서 문제가 생겼어요. 잠시 후 다시 시도해 주세요.",
    E002: "서버에서 문제가 생겼어요. 잠시 후 다시 시도해 주세요.",
};

/**
 * 오류를 사람이 읽을 한 문장으로 바꾼다.
 *
 * <p>순서가 중요하다. <b>입력값 검증 사유가 있으면 그것이 가장 구체적</b>이므로 먼저 쓴다
 * ("role : 다음 중 하나여야 합니다: OWNER, MEMBER, VIEWER"). 그 다음이 화면이 정한 문장,
 * 그 다음이 공통 문장이다. 메시지 키가 그대로 화면에 나가지 않도록 마지막에 한 번 더 거른다.
 *
 * @param messages 오류 코드("P007") → 그 화면에서 보여줄 문장
 */
export function describeApiError(
    err: unknown,
    messages: Record<string, string>,
    fallback: string
): string {
    // 응답 자체가 없으면 네트워크 문제다. axios 의 "Network Error" 를 그대로 보여주지 않는다.
    const hasResponse =
        !!err && typeof err === "object" && (err as Record<string, unknown>).response != null;
    if (!hasResponse) return "서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.";

    // 필드별 사유가 있으면 extractApiErrorMsg 가 그것부터 문장으로 만들어 준다.
    const detail = extractApiErrorMsg(err, fallback);
    if (!RAW_MESSAGE.test(detail) && detail !== fallback) return detail;

    const code = extractApiErrorCode(err);
    if (code) {
        const known = messages[code] ?? COMMON_ERROR_MESSAGES[code];
        if (known) return known;
        return `${fallback} (오류 코드: ${code})`;
    }
    return fallback;
}

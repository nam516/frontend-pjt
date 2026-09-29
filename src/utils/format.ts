// src/utils/format.ts

const pad2 = (n: number) => String(n).padStart(2, "0");

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** 오늘 날짜를 서버와 같은 표기(YYYY-MM-DD)로. 마감일 비교에 쓴다. */
export function todayISODate(): string {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** 2026-08-19T09:33:00 → "2026.08.19" */
export function formatDate(iso?: string | null): string {
    if (!iso) return "-";

    // "2026-08-19" 처럼 날짜만 있는 값은 Date 로 바꾸면 UTC 자정으로 해석된다.
    // 시간대에 따라 하루 밀려 보이므로 문자열 그대로 표기한다.
    const dateOnly = DATE_ONLY.exec(iso);
    if (dateOnly) return `${dateOnly[1]}.${dateOnly[2]}.${dateOnly[3]}`;

    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";

    return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
}

/** 상대 시간 — "방금", "3시간 전", "2일 전", 그 이상은 날짜 */
export function formatRelative(iso?: string | null): string {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";

    const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diffMin < 1) return "방금";
    if (diffMin < 60) return `${diffMin}분 전`;

    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간 전`;

    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}일 전`;

    return formatDate(iso);
}

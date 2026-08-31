// src/utils/format.ts

/** 2026-08-19T09:33:00 → "2026.08.19" */
export function formatDate(iso?: string | null): string {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";

    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
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

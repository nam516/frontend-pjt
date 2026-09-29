// src/utils/activityText.ts
import {
    ISSUE_TYPE_LABEL,
    PRIORITY_LABEL,
    type Activity,
    type ActivityField,
    type IssuePriority,
    type IssueType,
} from "@/types/issue";
import { formatDate } from "@/utils/format";

/**
 * 활동 기록을 사람이 읽을 문장으로 바꾼다 (로드맵 B4).
 * 서버는 코드(action·field)와 기록 시점 값만 준다. 문장은 화면이 정한다(QUESTIONS Q10 의 A).
 * B20(알림)도 같은 함수를 쓰면 문장이 한 곳에서 관리된다.
 */

const FIELD_LABEL: Record<ActivityField, string> = {
    TITLE: "제목",
    DESCRIPTION: "설명",
    TYPE: "종류",
    PRIORITY: "우선순위",
    ASSIGNEE: "담당자",
    START_DATE: "시작일",
    DUE_DATE: "마감일",
    STATUS: "상태",
};

/** 항목별로 값을 읽기 좋게. 비어 있으면 "없음". */
function valueText(field: ActivityField | null, value: string | null): string {
    if (value == null || value === "") return "없음";
    switch (field) {
        case "TYPE":
            return ISSUE_TYPE_LABEL[value as IssueType] ?? value;
        case "PRIORITY":
            return PRIORITY_LABEL[value as IssuePriority] ?? value;
        case "START_DATE":
        case "DUE_DATE":
            return formatDate(value);
        default:
            return value;
    }
}

export type ActivityLine = {
    /** "님이 상태를 바꿨습니다" 같은 본문 (작성자 이름 뒤에 붙는다) */
    text: string;
    /** 바뀐 값 "이전 → 이후". 없으면 null */
    change: { from: string; to: string } | null;
    /** 댓글 미리보기 같은 인용. 없으면 null */
    quote: string | null;
};

export function describeActivity(a: Activity): ActivityLine {
    switch (a.action) {
        case "CREATED":
            return { text: "님이 이슈를 만들었습니다", change: null, quote: null };
        case "DELETED":
            return { text: "님이 이슈를 지웠습니다", change: null, quote: null };
        case "COMMENTED":
            return { text: "님이 댓글을 남겼습니다", change: null, quote: a.newValue };
        case "MOVED":
        case "UPDATED": {
            const label = a.field ? FIELD_LABEL[a.field] : "내용";
            if (a.field === "DESCRIPTION") {
                return { text: `님이 ${label}을 고쳤습니다`, change: null, quote: null };
            }
            return {
                text: `님이 ${label}을(를) 바꿨습니다`,
                change: { from: valueText(a.field, a.oldValue), to: valueText(a.field, a.newValue) },
                quote: null,
            };
        }
        default:
            return { text: "님의 활동", change: null, quote: null };
    }
}

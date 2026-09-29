// src/constants/columnMessages.ts

/** 보드 컬럼 관리(B5)에서 서버가 막는 경우. 규칙은 memberMessages.ts 와 같다. */
export const COLUMN_ERROR_MESSAGES: Record<string, string> = {
    P002: "컬럼을 바꿀 권한이 없어요. 프로젝트 소유자만 할 수 있어요.",
    B001: "그 컬럼을 찾을 수 없어요. 새로고침해 주세요.",
    B002: "이슈가 남아 있는 컬럼은 지울 수 없어요. 이슈를 다른 컬럼으로 옮긴 뒤 지워 주세요.",
    B003: "마지막 남은 컬럼은 지울 수 없어요.",
    B004: "같은 이름의 컬럼이 이미 있어요.",
    B005: "더 옮길 수 없어요. 이미 맨 끝이에요.",
};

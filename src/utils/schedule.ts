// src/utils/schedule.ts

/**
 * 시작일·마감일 앞뒤 확인. 문제가 없으면 null, 있으면 화면에 띄울 문장.
 * 값은 `<input type="date">` 의 `YYYY-MM-DD` 문자열이라 문자열 비교로 날짜 순서가 맞다.
 * 서버도 같은 규칙으로 막는다(I007). 같은 날은 허용.
 */
export function scheduleError(startDate: string, dueDate: string): string | null {
    if (startDate && dueDate && startDate > dueDate) {
        return "시작일이 마감일보다 늦어요.";
    }
    return null;
}

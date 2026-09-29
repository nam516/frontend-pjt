// src/constants/commentMessages.ts

/** 댓글(B3)에서 서버가 막는 경우. 규칙은 memberMessages.ts 와 같다. */
export const COMMENT_ERROR_MESSAGES: Record<string, string> = {
    P002: "댓글을 쓸 권한이 없어요. 뷰어는 읽기만 할 수 있어요.",
    I001: "이슈가 지워졌어요. 보드를 새로 불러와 주세요.",
    I008: "이미 지워진 댓글이에요.",
    I009: "내가 쓴 댓글만 고칠 수 있어요. (지우기는 소유자도 할 수 있어요)",
    C002: "댓글은 1자 이상 4000자 이하로 써 주세요.",
};

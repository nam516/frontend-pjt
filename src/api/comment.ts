// src/api/comment.ts
import api from "./axios";
import { unwrap, type ApiResponse } from "./common";
import type { IssueComment } from "@/types/issue";

/* 이슈 댓글 (로드맵 B3). 목록은 VIEWER 이상, 작성은 MEMBER 이상, 수정은 본인, 삭제는 본인 또는 OWNER. */

const base = (issueId: number) => `/api/issues/${issueId}/comments`;

export async function fetchComments(issueId: number): Promise<IssueComment[]> {
    return unwrap(await api.get<ApiResponse<IssueComment[]>>(base(issueId)));
}

export async function createComment(issueId: number, content: string): Promise<IssueComment> {
    return unwrap(await api.post<ApiResponse<IssueComment>>(base(issueId), { content }));
}

export async function updateComment(
    issueId: number,
    commentId: number,
    content: string
): Promise<IssueComment> {
    return unwrap(
        await api.patch<ApiResponse<IssueComment>>(`${base(issueId)}/${commentId}`, { content })
    );
}

export async function deleteComment(issueId: number, commentId: number): Promise<void> {
    await api.delete(`${base(issueId)}/${commentId}`);
}

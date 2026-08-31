// src/api/issue.ts
import api from "./axios";
import { unwrap, type ApiResponse } from "./common";
import type {
    Board,
    IssueCreateReq,
    IssueDetail,
    IssueMoveReq,
    IssueUpdateReq,
} from "@/types/issue";

/** 칸반 보드 전체 — 이 한 번의 호출로 화면을 그린다 */
export async function fetchBoard(projectId: number): Promise<Board> {
    return unwrap(await api.get<ApiResponse<Board>>(`/api/projects/${projectId}/board`));
}

/** 이슈 생성 — 키(PJT-1)는 서버가 채번한다 */
export async function createIssue(
    projectId: number,
    req: IssueCreateReq
): Promise<IssueDetail> {
    return unwrap(await api.post<ApiResponse<IssueDetail>>(`/api/projects/${projectId}/issues`, req));
}

export async function fetchIssue(issueId: number): Promise<IssueDetail> {
    return unwrap(await api.get<ApiResponse<IssueDetail>>(`/api/issues/${issueId}`));
}

export async function updateIssue(
    issueId: number,
    req: IssueUpdateReq
): Promise<IssueDetail> {
    return unwrap(await api.patch<ApiResponse<IssueDetail>>(`/api/issues/${issueId}`, req));
}

/**
 * 보드 내 이동.
 * position 을 보내지 않고 "어느 컬럼의, 어떤 이슈 사이"만 알려준다.
 * 실제 좌표 계산은 서버가 조회 시점의 값으로 수행한다.
 */
export async function moveIssue(issueId: number, req: IssueMoveReq): Promise<IssueDetail> {
    return unwrap(await api.patch<ApiResponse<IssueDetail>>(`/api/issues/${issueId}/position`, req));
}

export async function deleteIssue(issueId: number): Promise<void> {
    await api.delete(`/api/issues/${issueId}`);
}

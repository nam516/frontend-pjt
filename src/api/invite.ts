// src/api/invite.ts
import api from "./axios";
import { unwrap, type ApiResponse } from "./common";
import type {
    InviteCreateReq,
    InvitePreview,
    ProjectInvite,
    ProjectSummary,
} from "@/types/project";

/**
 * 프로젝트 초대 코드 API (QUESTIONS.md Q3 의 답변 C).
 *
 * 경로가 둘로 나뉘어 있다.
 *  - `/api/projects/{projectId}/invites` — 코드를 만드는 쪽. OWNER 만 호출할 수 있다.
 *  - `/api/project-invites` — 코드를 쓰는 쪽. 부르는 사람은 projectId 를 모르고 코드만 안다.
 *
 * 쓸 수 없는 코드는 이유별로 코드가 다르다 (P010 기한 / P011 폐기 / P012 소진).
 * 문장은 constants/inviteMessages.ts 에 있다.
 */

/** 초대 코드 목록 (OWNER) — 최근에 만든 것부터 */
export async function fetchInvites(projectId: number): Promise<ProjectInvite[]> {
    return unwrap(
        await api.get<ApiResponse<ProjectInvite[]>>(`/api/projects/${projectId}/invites`)
    );
}

/** 초대 코드 발급 (OWNER) — 기존 코드는 그대로 남는다 */
export async function createInvite(
    projectId: number,
    req: InviteCreateReq
): Promise<ProjectInvite> {
    return unwrap(
        await api.post<ApiResponse<ProjectInvite>>(`/api/projects/${projectId}/invites`, req)
    );
}

/** 초대 코드 폐기 (OWNER) — 행은 지우지 않고 무효로만 만든다 */
export async function revokeInvite(projectId: number, inviteId: number): Promise<void> {
    await api.delete(`/api/projects/${projectId}/invites/${inviteId}`);
}

/**
 * 참여 전 미리보기 — 어느 프로젝트에 어떤 역할로 들어가는지.
 *
 * 쓸 수 없는 코드여도 성공한다. status 로 내려오므로 화면이 이유를 말할 수 있다.
 * 아예 없는 코드만 404(P009) 다.
 */
export async function previewInvite(code: string): Promise<InvitePreview> {
    return unwrap(
        await api.get<ApiResponse<InvitePreview>>(
            `/api/project-invites/${encodeURIComponent(code)}`
        )
    );
}

/**
 * 초대 코드로 참여하기.
 *
 * 코드는 본문으로 보낸다(경로·쿼리에 실으면 접속 로그에 남는다).
 * 이미 멤버면 오류가 아니라 그 프로젝트가 그대로 내려온다.
 */
export async function joinByInviteCode(code: string): Promise<ProjectSummary> {
    return unwrap(
        await api.post<ApiResponse<ProjectSummary>>("/api/project-invites/join", { code })
    );
}

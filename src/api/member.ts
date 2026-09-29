// src/api/member.ts
import api from "./axios";
import { unwrap, type ApiResponse } from "./common";
import type {
    MemberInviteReq,
    MemberRoleUpdateReq,
    ProjectMember,
} from "@/types/project";

/**
 * 프로젝트 멤버 API.
 *
 * 경로의 memberId 는 멤버십 id 다. 사용자 id 가 아니다.
 * 목록은 VIEWER 이상이면 볼 수 있고, 나머지 셋은 OWNER 만 호출할 수 있다.
 * 권한이 없으면 서버가 403 (P002) 로 막는다.
 */

/** 멤버 목록 — 역할이 높은 사람부터 내려온다 */
export async function fetchMembers(projectId: number): Promise<ProjectMember[]> {
    return unwrap(
        await api.get<ApiResponse<ProjectMember[]>>(`/api/projects/${projectId}/members`)
    );
}

/** 멤버 초대 (OWNER) — 이미 가입한 사용자의 loginId 여야 한다 */
export async function inviteMember(
    projectId: number,
    req: MemberInviteReq
): Promise<ProjectMember> {
    return unwrap(
        await api.post<ApiResponse<ProjectMember>>(`/api/projects/${projectId}/members`, req)
    );
}

/** 역할 변경 (OWNER) — 자기 자신을 OWNER 에서 내릴 수 없고, 마지막 OWNER 도 내릴 수 없다 */
export async function changeMemberRole(
    projectId: number,
    memberId: number,
    req: MemberRoleUpdateReq
): Promise<ProjectMember> {
    return unwrap(
        await api.patch<ApiResponse<ProjectMember>>(
            `/api/projects/${projectId}/members/${memberId}`,
            req
        )
    );
}

/** 멤버 제거 (OWNER) — 그 사람에게 걸린 담당은 서버가 함께 푼다 */
export async function removeMember(projectId: number, memberId: number): Promise<void> {
    await api.delete(`/api/projects/${projectId}/members/${memberId}`);
}

/**
 * 프로젝트 나가기 (본인, VIEWER 이상) — 로드맵 B14.
 * 마지막 소유자는 나갈 수 없다(P007). 내게 걸린 담당은 서버가 함께 푼다.
 */
export async function leaveProject(projectId: number): Promise<void> {
    await api.delete(`/api/projects/${projectId}/members/me`);
}

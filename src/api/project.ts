// src/api/project.ts
import api from "./axios";
import { unwrap, type ApiResponse } from "./common";
import type {
    ProjectCreateReq,
    ProjectDetail,
    ProjectSummary,
    ProjectUpdateReq,
} from "@/types/project";

/** 내가 속한 프로젝트 목록 */
export async function fetchMyProjects(): Promise<ProjectSummary[]> {
    return unwrap(await api.get<ApiResponse<ProjectSummary[]>>("/api/projects"));
}

/** 프로젝트 생성 — 서버가 OWNER 멤버 등록과 기본 컬럼 3개 생성을 함께 처리한다 */
export async function createProject(req: ProjectCreateReq): Promise<ProjectDetail> {
    return unwrap(await api.post<ApiResponse<ProjectDetail>>("/api/projects", req));
}

/** 프로젝트 상세 (보드 컬럼 포함) */
export async function fetchProject(projectId: number): Promise<ProjectDetail> {
    return unwrap(await api.get<ApiResponse<ProjectDetail>>(`/api/projects/${projectId}`));
}

/** 이름·설명 수정 (OWNER) */
export async function updateProject(
    projectId: number,
    req: ProjectUpdateReq
): Promise<ProjectDetail> {
    return unwrap(await api.patch<ApiResponse<ProjectDetail>>(`/api/projects/${projectId}`, req));
}

/** 보관 처리 (OWNER) — 물리 삭제가 아니다 */
export async function archiveProject(projectId: number): Promise<void> {
    await api.delete(`/api/projects/${projectId}`);
}

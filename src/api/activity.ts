// src/api/activity.ts
import api from "./axios";
import { unwrap, type ApiResponse } from "./common";
import type { Activity } from "@/types/issue";

/** 이슈의 활동 기록 (VIEWER 이상), 최신이 먼저 — 로드맵 B4 */
export async function fetchIssueActivities(issueId: number): Promise<Activity[]> {
    return unwrap(await api.get<ApiResponse<Activity[]>>(`/api/issues/${issueId}/activities`));
}

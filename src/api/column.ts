// src/api/column.ts
import api from "./axios";
import { unwrap, type ApiResponse } from "./common";
import type { BoardColumn, ColumnCategory } from "@/types/project";

/*
 * 보드 컬럼 관리 (로드맵 B5, OWNER 만).
 * 모든 요청은 바뀐 뒤의 컬럼 전체(position 순)를 돌려준다. 화면은 목록을 통째로 갈아 끼운다.
 */

const base = (projectId: number) => `/api/projects/${projectId}/columns`;

/** 컬럼 추가 — 맨 오른쪽에 붙는다 */
export async function createColumn(
    projectId: number,
    req: { name: string; category: ColumnCategory }
): Promise<BoardColumn[]> {
    return unwrap(await api.post<ApiResponse<BoardColumn[]>>(base(projectId), req));
}

/** 이름·성격 변경 — 보낸 항목만 바뀐다 */
export async function updateColumn(
    projectId: number,
    columnId: number,
    req: { name?: string; category?: ColumnCategory }
): Promise<BoardColumn[]> {
    return unwrap(await api.patch<ApiResponse<BoardColumn[]>>(`${base(projectId)}/${columnId}`, req));
}

/** 한 칸 옮기기 — -1 왼쪽, +1 오른쪽 */
export async function moveColumn(
    projectId: number,
    columnId: number,
    offset: -1 | 1
): Promise<BoardColumn[]> {
    return unwrap(
        await api.patch<ApiResponse<BoardColumn[]>>(`${base(projectId)}/${columnId}/move`, { offset })
    );
}

/** 삭제 — 이슈가 있거나(B002) 마지막 하나면(B003) 서버가 거부한다 */
export async function deleteColumn(projectId: number, columnId: number): Promise<BoardColumn[]> {
    return unwrap(await api.delete<ApiResponse<BoardColumn[]>>(`${base(projectId)}/${columnId}`));
}

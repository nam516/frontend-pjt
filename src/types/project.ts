// src/types/project.ts

export type ProjectRole = "OWNER" | "MEMBER" | "VIEWER";

export type ColumnCategory = "TODO" | "IN_PROGRESS" | "DONE";

/** 보드 컬럼 — 백엔드 ProjectResDTO.BoardColumn */
export type BoardColumn = {
    id: number;
    name: string;
    category: ColumnCategory;
    position: number;
};

/** 프로젝트 목록 항목 — 백엔드 ProjectResDTO.Summary */
export type ProjectSummary = {
    id: number;
    projectKey: string;
    name: string;
    description: string | null;
    myRole: ProjectRole;
    lastModDttm: string;
};

/** 프로젝트 상세 — 백엔드 ProjectResDTO.Detail */
export type ProjectDetail = {
    id: number;
    projectKey: string;
    name: string;
    description: string | null;
    ownerId: number;
    myRole: ProjectRole;
    columns: BoardColumn[];
    fstRegDttm: string;
    lastModDttm: string;
};

export type ProjectCreateReq = {
    projectKey: string;
    name: string;
    description?: string;
};

export type ProjectUpdateReq = {
    name?: string;
    description?: string;
};

export const ROLE_LABEL: Record<ProjectRole, string> = {
    OWNER: "소유자",
    MEMBER: "멤버",
    VIEWER: "뷰어",
};

export const CATEGORY_LABEL: Record<ColumnCategory, string> = {
    TODO: "할 일",
    IN_PROGRESS: "진행 중",
    DONE: "완료",
};

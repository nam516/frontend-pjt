// src/types/issue.ts
import type { ColumnCategory, ProjectRole } from "./project";

export type IssueType = "TASK" | "BUG" | "STORY";

export type IssuePriority = "LOWEST" | "LOW" | "MEDIUM" | "HIGH" | "HIGHEST";

/** 보드 카드 — 백엔드 IssueResDTO.Card */
export type IssueCard = {
    id: number;
    issueKey: string;
    title: string;
    issueType: IssueType;
    priority: IssuePriority;
    assigneeId: number | null;
    assigneeName: string | null;
    dueDate: string | null;
    position: number;
};

/** 보드 컬럼 — 백엔드 IssueResDTO.BoardColumn */
export type BoardColumn = {
    id: number;
    name: string;
    category: ColumnCategory;
    position: number;
    issues: IssueCard[];
};

/** 칸반 보드 전체 — 백엔드 IssueResDTO.Board */
export type Board = {
    projectId: number;
    projectKey: string;
    projectName: string;
    myRole: ProjectRole;
    columns: BoardColumn[];
};

/** 이슈 상세 — 백엔드 IssueResDTO.Detail */
export type IssueDetail = {
    id: number;
    projectId: number;
    projectKey: string;
    issueKey: string;
    columnId: number;
    columnName: string;
    title: string;
    description: string | null;
    issueType: IssueType;
    priority: IssuePriority;
    assigneeId: number | null;
    assigneeName: string | null;
    reporterId: number;
    reporterName: string | null;
    dueDate: string | null;
    position: number;
    fstRegDttm: string;
    lastModDttm: string;
};

export type IssueCreateReq = {
    columnId: number;
    title: string;
    description?: string;
    issueType?: IssueType;
    priority?: IssuePriority;
    assigneeId?: number;
    dueDate?: string;
};

export type IssueUpdateReq = {
    title?: string;
    description?: string;
    issueType?: IssueType;
    priority?: IssuePriority;
    assigneeId?: number;
    dueDate?: string;
    clearAssignee?: boolean;
    clearDueDate?: boolean;
};

/** 이동 요청 — position 은 서버가 계산한다 */
export type IssueMoveReq = {
    targetColumnId: number;
    prevIssueId: number | null;
    nextIssueId: number | null;
};

export const ISSUE_TYPE_LABEL: Record<IssueType, string> = {
    TASK: "작업",
    BUG: "버그",
    STORY: "스토리",
};

export const PRIORITY_LABEL: Record<IssuePriority, string> = {
    LOWEST: "가장 낮음",
    LOW: "낮음",
    MEDIUM: "보통",
    HIGH: "높음",
    HIGHEST: "가장 높음",
};

export const ISSUE_TYPES: IssueType[] = ["TASK", "BUG", "STORY"];
export const PRIORITIES: IssuePriority[] = ["LOWEST", "LOW", "MEDIUM", "HIGH", "HIGHEST"];

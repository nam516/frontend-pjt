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

/**
 * 프로젝트 멤버 — 백엔드 ProjectMemberResDTO.Item
 *
 * memberId 는 <b>멤버십 id</b>지 사용자 id 가 아니다.
 * 역할 변경·제거 요청의 경로에 쓰는 값은 memberId 쪽이다.
 * loginId·userNm·email 은 사용자 행이 지워진 경우 null 이 올 수 있다.
 */
export type ProjectMember = {
    memberId: number;
    userId: number;
    loginId: string | null;
    userNm: string | null;
    email: string | null;
    role: ProjectRole;
    joinedDttm: string;
};

/** 멤버 초대 — loginId 로 직접 추가한다. role 을 비우면 서버가 MEMBER 로 넣는다. */
export type MemberInviteReq = {
    loginId: string;
    role?: ProjectRole;
};

/** 역할 변경 */
export type MemberRoleUpdateReq = {
    role: ProjectRole;
};

/** 역할 선택기에 보여줄 순서. 권한이 높은 것부터. */
export const ROLE_OPTIONS: ProjectRole[] = ["OWNER", "MEMBER", "VIEWER"];

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

// ── 초대 코드 (QUESTIONS Q3 의 답변 C) ──────────────────────

/** 초대 코드 상태 — 서버가 조회 시점에 계산해 내려준다 */
export type InviteStatus = "ACTIVE" | "EXPIRED" | "REVOKED" | "EXHAUSTED";

/** 코드로 줄 수 있는 역할. OWNER 는 코드로 넘기지 않는다(서버가 P013 으로 막는다). */
export type InvitableRole = Exclude<ProjectRole, "OWNER">;

/**
 * 초대 코드 — 백엔드 ProjectInviteResDTO.Item
 *
 * expiresDttm 이 null 이면 기한 없음, maxUses 가 null 이면 사용 횟수 제한 없음이다.
 * "제한 없음"을 0 이나 먼 미래 날짜로 표현하지 않는다.
 */
export type ProjectInvite = {
    inviteId: number;
    code: string;
    role: ProjectRole;
    status: InviteStatus;
    expiresDttm: string | null;
    maxUses: number | null;
    useCount: number;
    fstRegDttm: string;
};

/** 초대 코드 발급 — 비운 값은 "제한 없음"이다 */
export type InviteCreateReq = {
    role?: InvitableRole;
    expiresInDays?: number;
    maxUses?: number;
};

/** 참여 전 미리보기 — 백엔드 ProjectInviteResDTO.Preview */
export type InvitePreview = {
    projectId: number;
    projectKey: string;
    projectName: string;
    role: ProjectRole;
    status: InviteStatus;
    alreadyMember: boolean;
};

/** 발급 화면의 역할 선택기 순서 */
export const INVITE_ROLE_OPTIONS: InvitableRole[] = ["MEMBER", "VIEWER"];

export const INVITE_STATUS_LABEL: Record<InviteStatus, string> = {
    ACTIVE: "사용 가능",
    EXPIRED: "기한 지남",
    REVOKED: "폐기됨",
    EXHAUSTED: "횟수 다 씀",
};

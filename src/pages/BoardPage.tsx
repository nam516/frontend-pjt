// src/pages/BoardPage.tsx
import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import Spinner from "@/components/common/Spinner";
import BoardColumnView from "@/components/issue/BoardColumnView";
import IssueCreateModal from "@/components/issue/IssueCreateModal";
import IssueDetailModal from "@/components/issue/IssueDetailModal";
import { IssueCardPreview } from "@/components/issue/IssueCard";
import { useBoard } from "@/hooks/useBoard";
import { useMembers } from "@/hooks/useMembers";
import type { Board, IssueCard } from "@/types/issue";
import "@/styles/components.css";
import "@/styles/project.css";
import "@/styles/board.css";

/**
 * 한 칸 규칙: 카드는 드래그를 시작한 컬럼과 그 바로 왼쪽·오른쪽 컬럼에만 놓을 수 있다.
 * (2026-09-29 최재준님 요청. 서버도 I006 으로 막는다) 컬럼 순서는 보드 응답의 순서(position 순)다.
 */
function isReachable(board: Board, originColumnId: number, targetColumnId: number): boolean {
    const from = board.columns.findIndex((c) => c.id === originColumnId);
    const to = board.columns.findIndex((c) => c.id === targetColumnId);
    return from >= 0 && to >= 0 && Math.abs(from - to) <= 1;
}

/** 드롭 대상에서 "어느 컬럼의 몇 번째"를 알아낸다. */
function resolveDropTarget(
    board: Board,
    overId: string | number,
    overData: Record<string, unknown> | undefined
): { columnId: number; index: number } | null {
    // 빈 컬럼 위 — 컬럼 자체가 droppable
    if (overData?.type === "column") {
        const columnId = overData.columnId as number;
        const column = board.columns.find((c) => c.id === columnId);
        return column ? { columnId, index: column.issues.length } : null;
    }

    // 카드 위 — 그 카드가 있는 컬럼의 그 자리
    for (const column of board.columns) {
        const index = column.issues.findIndex((i) => i.id === Number(overId));
        if (index >= 0) return { columnId: column.id, index };
    }
    return null;
}

export default function BoardPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const id = Number(projectId);

    const { state, getBoard, reload, applyLocalMove, commitMove, toast, clearToast } =
        useBoard(id);

    // 담당자 선택지. 모달을 열 때마다 읽지 않고 보드와 함께 한 번 읽어 둔다.
    // 멤버 수는 많아야 수십이라 싸고, 모달이 열리자마자 선택지가 차 있다.
    const { state: membersState } = useMembers(id);
    const members = membersState.status === "ready" ? membersState.members : null;
    const membersError = membersState.status === "error" ? membersState.message : null;

    const [activeIssue, setActiveIssue] = useState<IssueCard | null>(null);

    /**
     * 드래그를 <b>시작한</b> 컬럼. 드래그 중에는 applyLocalMove 로 카드가 옆 컬럼에 미리 옮겨지므로
     * "지금 있는 컬럼" 을 기준으로 삼으면 한 칸씩 계속 밀려 두 칸 이상 갈 수 있다. 그래서 시작점을 따로 든다.
     * 핸들러는 ref 를, 화면(흐리게 표시)은 state 를 본다.
     */
    const originRef = useRef<number | null>(null);
    const [originColumnId, setOriginColumnId] = useState<number | null>(null);
    const setOrigin = (columnId: number | null) => {
        originRef.current = columnId;
        setOriginColumnId(columnId);
    };
    const [createColumnId, setCreateColumnId] = useState<number | null>(null);
    const [detailIssueId, setDetailIssueId] = useState<number | null>(null);

    /**
     * 알림(B20)에서 들어오면 주소가 `/board?issue=12` 다. 그 이슈의 상세를 바로 연다.
     * 카드를 눌러 연 것(detailIssueId)이 있으면 그쪽이 먼저다. 닫을 때 주소의 issue 도 지운다
     * (남겨 두면 새로고침할 때마다 다시 열린다).
     */
    const [searchParams, setSearchParams] = useSearchParams();
    const paramIssueId = Number(searchParams.get("issue")) || null;
    const openIssueId = detailIssueId ?? paramIssueId;
    const closeDetail = () => {
        setDetailIssueId(null);
        if (paramIssueId != null) {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    next.delete("issue");
                    return next;
                },
                { replace: true }
            );
        }
    };

    // 짧은 클릭은 드래그가 아니라 "열기"다. 5px 이상 움직여야 드래그로 친다.
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const board = state.status === "ready" ? state.board : null;
    const canEdit = board != null && board.myRole !== "VIEWER";

    const totalIssues = useMemo(
        () => board?.columns.reduce((sum, c) => sum + c.issues.length, 0) ?? 0,
        [board]
    );

    const handleDragStart = (e: DragStartEvent) => {
        const data = e.active.data.current;
        if (data?.type === "issue") setActiveIssue(data.issue as IssueCard);

        const current = getBoard();
        const activeId = Number(e.active.id);
        const from = current?.columns.find((c) => c.issues.some((i) => i.id === activeId));
        setOrigin(from ? from.id : null);
    };

    /**
     * 드래그 중 계속 호출된다. 화면만 미리 바꿔 두고 서버는 건드리지 않는다.
     *
     * 렌더 사이사이에 여러 번 들어오므로 화면 상태(board)가 아니라
     * 항상 최신인 getBoard() 를 본다. 그렇지 않으면 빠르게 끌 때
     * 한 박자 늦은 자리로 계산된다.
     */
    const handleDragOver = (e: DragOverEvent) => {
        const current = getBoard();
        if (!current || !e.over) return;

        const activeId = Number(e.active.id);
        const target = resolveDropTarget(current, e.over.id, e.over.data.current ?? undefined);
        if (!target) return;

        // 두 칸 이상 떨어진 컬럼 위에서는 미리보기도 하지 않는다.
        const origin = originRef.current;
        if (origin != null && !isReachable(current, origin, target.columnId)) return;

        const from = current.columns.find((c) => c.issues.some((i) => i.id === activeId));
        if (!from) return;

        const fromIndex = from.issues.findIndex((i) => i.id === activeId);
        if (from.id === target.columnId && fromIndex === target.index) return;

        applyLocalMove(activeId, target.columnId, target.index);
    };

    /**
     * 놓는 순간에만 서버에 반영한다. 드래그 내내 요청을 보내면 서버가 요동친다.
     * 어느 컬럼의 몇 번째인지는 훅이 직접 최신 상태에서 읽는다.
     */
    const handleDragEnd = (e: DragEndEvent) => {
        setActiveIssue(null);
        const origin = originRef.current;
        setOrigin(null);
        if (!e.over) return;

        // 갈 수 없는 컬럼 위에서 놓았다면, 지나오며 미리 옮겨진 자리를 저장하지 않고 원래대로 되돌린다.
        const current = getBoard();
        if (current && origin != null) {
            const target = resolveDropTarget(current, e.over.id, e.over.data.current ?? undefined);
            if (target && !isReachable(current, origin, target.columnId)) {
                void reload();
                return;
            }
        }

        void commitMove(Number(e.active.id));
    };

    return (
        // 프로젝트 이름·역할과 "← 프로젝트" 는 ProjectLayout 머리글·탭이 맡는다. 여기는 보드 도구줄만.
        <div className="board-page">
            <div className="board-toolbar">
                <span className="board-top__spacer" />

                {board && <span className="board-top__count">이슈 {totalIssues}개</span>}

                {canEdit && board && board.columns.length > 0 && (
                    <button
                        className="btn btn--primary btn--auto btn--sm"
                        onClick={() => setCreateColumnId(board.columns[0].id)}
                    >
                        + 이슈
                    </button>
                )}
            </div>

            {state.status === "loading" && <Spinner label="보드를 여는 중..." />}

            {state.status === "error" && (
                <div className="app-main">
                    <div className="alert">{state.message}</div>
                    <button
                        className="btn btn--outline btn--auto btn--sm"
                        onClick={() => navigate("/projects")}
                    >
                        목록으로
                    </button>
                </div>
            )}

            {board && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDragCancel={() => {
                        setActiveIssue(null);
                        setOrigin(null);
                        void reload(); // 취소하면 화면이 서버와 어긋난 채 남는다
                    }}
                >
                    <div className="board-canvas">
                        {board.columns.map((column, index) => (
                            <BoardColumnView
                                key={column.id}
                                column={column}
                                canAdd={canEdit && index === 0}
                                blocked={
                                    originColumnId != null &&
                                    !isReachable(board, originColumnId, column.id)
                                }
                                onAddIssue={setCreateColumnId}
                                onOpenIssue={(issue) => setDetailIssueId(issue.id)}
                            />
                        ))}
                    </div>

                    {/* 커서를 따라다니는 미리보기 — 원본은 자리만 지킨다 */}
                    <DragOverlay dropAnimation={null}>
                        {activeIssue && <IssueCardPreview issue={activeIssue} />}
                    </DragOverlay>
                </DndContext>
            )}

            {board && createColumnId != null && (
                <IssueCreateModal
                    projectId={id}
                    columns={board.columns}
                    defaultColumnId={createColumnId}
                    members={members}
                    membersError={membersError}
                    onClose={() => setCreateColumnId(null)}
                    onCreated={() => {
                        setCreateColumnId(null);
                        void reload();
                    }}
                />
            )}

            {openIssueId != null && (
                <IssueDetailModal
                    key={openIssueId}
                    issueId={openIssueId}
                    canEdit={canEdit}
                    members={members}
                    membersError={membersError}
                    onClose={closeDetail}
                    onSaved={() => {
                        closeDetail();
                        void reload();
                    }}
                    onDeleted={() => {
                        closeDetail();
                        void reload();
                    }}
                />
            )}

            {toast && (
                <div className="toast" role="status">
                    <span>{toast}</span>
                    <button className="toast__close" onClick={clearToast} aria-label="닫기">
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}

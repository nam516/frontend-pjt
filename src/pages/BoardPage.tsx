// src/pages/BoardPage.tsx
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { ROLE_LABEL } from "@/types/project";
import type { Board, IssueCard } from "@/types/issue";
import "@/styles/components.css";
import "@/styles/project.css";
import "@/styles/board.css";

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

    const { state, reload, applyLocalMove, commitMove, toast, clearToast } = useBoard(id);

    const [activeIssue, setActiveIssue] = useState<IssueCard | null>(null);
    const [createColumnId, setCreateColumnId] = useState<number | null>(null);
    const [detailIssueId, setDetailIssueId] = useState<number | null>(null);

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
    };

    /** 드래그 중 계속 호출된다. 화면만 미리 바꿔 두고 서버는 건드리지 않는다. */
    const handleDragOver = (e: DragOverEvent) => {
        if (!board || !e.over) return;

        const activeId = Number(e.active.id);
        const target = resolveDropTarget(board, e.over.id, e.over.data.current ?? undefined);
        if (!target) return;

        const from = board.columns.find((c) => c.issues.some((i) => i.id === activeId));
        if (!from) return;

        const fromIndex = from.issues.findIndex((i) => i.id === activeId);
        if (from.id === target.columnId && fromIndex === target.index) return;

        applyLocalMove(activeId, target.columnId, target.index);
    };

    /** 놓는 순간에만 서버에 반영한다. 드래그 내내 요청을 보내면 서버가 요동친다. */
    const handleDragEnd = (e: DragEndEvent) => {
        setActiveIssue(null);
        if (!board || !e.over) return;

        const activeId = Number(e.active.id);
        const column = board.columns.find((c) => c.issues.some((i) => i.id === activeId));
        if (column) void commitMove(activeId, column.id);
    };

    return (
        <div className="board-shell">
            <header className="board-top">
                <button className="board-top__back" onClick={() => navigate(`/projects/${id}`)}>
                    ← 프로젝트
                </button>

                {board && (
                    <>
                        <span className="badge badge--key">{board.projectKey}</span>
                        <h1 className="board-top__title">{board.projectName}</h1>
                        <span className="badge badge--role">{ROLE_LABEL[board.myRole]}</span>
                    </>
                )}

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
            </header>

            {state.status === "loading" && <Spinner label="보드를 여는 중..." />}

            {state.status === "error" && (
                <main className="app-main">
                    <div className="alert">{state.message}</div>
                    <button
                        className="btn btn--outline btn--auto btn--sm"
                        onClick={() => navigate("/projects")}
                    >
                        목록으로
                    </button>
                </main>
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
                        void reload(); // 취소하면 화면이 서버와 어긋난 채 남는다
                    }}
                >
                    <div className="board-canvas">
                        {board.columns.map((column) => (
                            <BoardColumnView
                                key={column.id}
                                column={column}
                                canEdit={canEdit}
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
                    onClose={() => setCreateColumnId(null)}
                    onCreated={() => {
                        setCreateColumnId(null);
                        void reload();
                    }}
                />
            )}

            {detailIssueId != null && (
                <IssueDetailModal
                    issueId={detailIssueId}
                    canEdit={canEdit}
                    onClose={() => setDetailIssueId(null)}
                    onSaved={() => {
                        setDetailIssueId(null);
                        void reload();
                    }}
                    onDeleted={() => {
                        setDetailIssueId(null);
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

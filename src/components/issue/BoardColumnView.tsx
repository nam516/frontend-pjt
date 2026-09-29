import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import IssueCard from "./IssueCard";
import type { BoardColumn, IssueCard as IssueCardType } from "@/types/issue";

type Props = {
    column: BoardColumn;
    /** "+ 이슈 추가" 를 보여 줄지. 첫 컬럼에만 연다 (이슈는 첫 컬럼에서만 만든다) */
    canAdd: boolean;
    /** 드래그 중인 카드가 여기로 올 수 없는가 (한 칸씩만 이동) — 흐리게 보여 준다 */
    blocked: boolean;
    onAddIssue: (columnId: number) => void;
    onOpenIssue: (issue: IssueCardType) => void;
};

/**
 * 이름이 잘 알려진 컬럼의 점 색. category 가 같아도(테스트·진행 중은 둘 다 IN_PROGRESS)
 * 눈으로 구분되게 한다. 여기 없는 이름은 category 색을 그대로 쓴다.
 */
const NAMED_TONE: Record<string, string> = {
    테스트: "test",
    보류: "hold",
    취소: "cancel",
};

/** 보드의 세로 컬럼 하나. 카드를 놓을 수 있는 영역(droppable)이다. */
export default function BoardColumnView({ column, canAdd, blocked, onAddIssue, onOpenIssue }: Props) {
    // 컬럼이 비어 있어도 카드를 놓을 수 있어야 하므로 컬럼 자체를 droppable 로 둔다.
    const { setNodeRef, isOver } = useDroppable({
        id: `column-${column.id}`,
        data: { type: "column", columnId: column.id },
    });

    return (
        <section
            className={`bcol${isOver && !blocked ? " bcol--over" : ""}${blocked ? " bcol--blocked" : ""}`}
        >
            <header className="bcol__head">
                <span
                    className={`bcol__dot bcol__dot--${
                        NAMED_TONE[column.name] ?? column.category.toLowerCase()
                    }`}
                />
                <h2 className="bcol__name">{column.name}</h2>
                <span className="bcol__count">{column.issues.length}</span>
            </header>

            <div ref={setNodeRef} className="bcol__body">
                <SortableContext
                    items={column.issues.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {column.issues.map((issue) => (
                        <IssueCard key={issue.id} issue={issue} onOpen={onOpenIssue} />
                    ))}
                </SortableContext>

                {column.issues.length === 0 && (
                    <p className="bcol__empty">여기로 카드를 끌어다 놓으세요</p>
                )}

                {/* 컬럼이 화면 높이만큼 길어졌으므로 추가 버튼을 맨 아래가 아니라 카드 바로 뒤에 둔다 (Jira 와 같은 자리) */}
                {canAdd && (
                    <button className="bcol__add" onClick={() => onAddIssue(column.id)}>
                        + 이슈 추가
                    </button>
                )}
            </div>
        </section>
    );
}

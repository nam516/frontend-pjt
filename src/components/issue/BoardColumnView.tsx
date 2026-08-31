import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import IssueCard from "./IssueCard";
import type { BoardColumn, IssueCard as IssueCardType } from "@/types/issue";

type Props = {
    column: BoardColumn;
    canEdit: boolean;
    onAddIssue: (columnId: number) => void;
    onOpenIssue: (issue: IssueCardType) => void;
};

/** 보드의 세로 컬럼 하나. 카드를 놓을 수 있는 영역(droppable)이다. */
export default function BoardColumnView({ column, canEdit, onAddIssue, onOpenIssue }: Props) {
    // 컬럼이 비어 있어도 카드를 놓을 수 있어야 하므로 컬럼 자체를 droppable 로 둔다.
    const { setNodeRef, isOver } = useDroppable({
        id: `column-${column.id}`,
        data: { type: "column", columnId: column.id },
    });

    return (
        <section className={`bcol${isOver ? " bcol--over" : ""}`}>
            <header className="bcol__head">
                <span className={`bcol__dot bcol__dot--${column.category.toLowerCase()}`} />
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
            </div>

            {canEdit && (
                <button className="bcol__add" onClick={() => onAddIssue(column.id)}>
                    + 이슈 추가
                </button>
            )}
        </section>
    );
}

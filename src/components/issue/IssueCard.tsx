import { useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Avatar from "./Avatar";
import IssueTypeIcon from "./IssueTypeIcon";
import PriorityBadge from "./PriorityBadge";
import type { IssueCard as IssueCardType } from "@/types/issue";
import { formatDate, todayISODate } from "@/utils/format";

type Props = {
    issue: IssueCardType;
    onOpen?: (issue: IssueCardType) => void;
};

/** 보드 위의 카드 하나. 드래그 대상이자 클릭 시 상세를 연다. */
export default function IssueCard({ issue, onOpen }: Props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: issue.id,
        data: { type: "issue", issue },
    });

    // 마감일은 날짜만 있는 값(YYYY-MM-DD)이다. Date 로 바꾸면 UTC 자정으로
    // 해석돼 시간대에 따라 하루씩 어긋난다. 문자열끼리 비교한다.
    const overdue = issue.dueDate != null && issue.dueDate < todayISODate();

    // 카드를 조금만 끌어도 브라우저는 마지막에 click 을 한 번 더 쏜다.
    // 그대로 두면 옮기자마자 상세 모달이 열린다. 누른 지점에서 얼마나
    // 움직였는지를 재서, 드래그였으면 여는 동작을 건너뛴다.
    const pressedAt = useRef<{ x: number; y: number } | null>(null);
    const DRAG_SLOP = 5; // PointerSensor 의 activationConstraint 와 같은 값

    return (
        <article
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={`card-issue${isDragging ? " card-issue--dragging" : ""}`}
            {...attributes}
            {...listeners}
            onPointerDown={(e) => {
                pressedAt.current = { x: e.clientX, y: e.clientY };
                listeners?.onPointerDown?.(e);
            }}
            onClick={(e) => {
                const from = pressedAt.current;
                pressedAt.current = null;
                if (from && Math.hypot(e.clientX - from.x, e.clientY - from.y) >= DRAG_SLOP) return;
                onOpen?.(issue);
            }}
        >
            <p className="card-issue__title">{issue.title}</p>

            <footer className="card-issue__foot">
                <IssueTypeIcon type={issue.issueType} />
                <span className="card-issue__key">{issue.issueKey}</span>
                <PriorityBadge priority={issue.priority} />

                <span className="card-issue__spacer" />

                {issue.dueDate && (
                    <span className={`card-issue__due${overdue ? " card-issue__due--over" : ""}`}>
                        {formatDate(issue.dueDate)}
                    </span>
                )}
                <Avatar name={issue.assigneeName} size={22} />
            </footer>
        </article>
    );
}

/** 드래그 중 커서를 따라다니는 미리보기. 원본 카드와 같은 모양이되 살짝 기울인다. */
export function IssueCardPreview({ issue }: { issue: IssueCardType }) {
    return (
        <article className="card-issue card-issue--overlay">
            <p className="card-issue__title">{issue.title}</p>
            <footer className="card-issue__foot">
                <IssueTypeIcon type={issue.issueType} />
                <span className="card-issue__key">{issue.issueKey}</span>
                <PriorityBadge priority={issue.priority} />
                <span className="card-issue__spacer" />
                <Avatar name={issue.assigneeName} size={22} />
            </footer>
        </article>
    );
}

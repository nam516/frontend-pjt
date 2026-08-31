import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Avatar from "./Avatar";
import IssueTypeIcon from "./IssueTypeIcon";
import PriorityBadge from "./PriorityBadge";
import type { IssueCard as IssueCardType } from "@/types/issue";
import { formatDate } from "@/utils/format";

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

    const overdue =
        issue.dueDate != null && new Date(issue.dueDate) < new Date(new Date().toDateString());

    return (
        <article
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={`card-issue${isDragging ? " card-issue--dragging" : ""}`}
            onClick={() => onOpen?.(issue)}
            {...attributes}
            {...listeners}
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

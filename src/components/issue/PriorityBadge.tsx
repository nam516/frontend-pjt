import { PRIORITY_LABEL, type IssuePriority } from "@/types/issue";

const ARROW: Record<IssuePriority, string> = {
    HIGHEST: "⌃⌃",
    HIGH: "⌃",
    MEDIUM: "=",
    LOW: "⌄",
    LOWEST: "⌄⌄",
};

type Props = {
    priority: IssuePriority;
};

export default function PriorityBadge({ priority }: Props) {
    return (
        <span
            className={`prio prio--${priority.toLowerCase()}`}
            title={`우선순위 ${PRIORITY_LABEL[priority]}`}
        >
            {ARROW[priority]}
        </span>
    );
}

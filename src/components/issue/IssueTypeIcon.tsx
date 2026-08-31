import { ISSUE_TYPE_LABEL, type IssueType } from "@/types/issue";

const ICON: Record<IssueType, string> = {
    TASK: "✔",
    BUG: "✖",
    STORY: "◆",
};

type Props = {
    type: IssueType;
};

/** 이슈 종류를 색과 기호로 구분한다. 지라의 아이콘 역할. */
export default function IssueTypeIcon({ type }: Props) {
    return (
        <span
            className={`type-icon type-icon--${type.toLowerCase()}`}
            title={ISSUE_TYPE_LABEL[type]}
            aria-label={ISSUE_TYPE_LABEL[type]}
        >
            {ICON[type]}
        </span>
    );
}

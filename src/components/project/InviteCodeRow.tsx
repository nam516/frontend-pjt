// src/components/project/InviteCodeRow.tsx
import { formatDate } from "@/utils/format";
import {
    INVITE_STATUS_LABEL,
    ROLE_LABEL,
    type ProjectInvite,
} from "@/types/project";

type Props = {
    invite: ProjectInvite;
    /** 방금 발급된 줄인가. 목록이 길어졌을 때 새 코드를 눈으로 찾게 해 준다. */
    fresh: boolean;
    /** 이 줄에 요청이 나가 있는가 */
    busy: boolean;
    onCopy: (invite: ProjectInvite) => void;
    onRevoke: (invite: ProjectInvite) => void;
};

/** "3 / 10명" 또는 "3명 참여" */
function usesText(invite: ProjectInvite): string {
    return invite.maxUses === null
        ? `${invite.useCount}명 참여`
        : `${invite.useCount} / ${invite.maxUses}명`;
}

/** "2026.09.29 까지" 또는 "기한 없음" */
function expiryText(invite: ProjectInvite): string {
    return invite.expiresDttm === null ? "기한 없음" : `${formatDate(invite.expiresDttm)} 까지`;
}

/**
 * 초대 코드 한 줄.
 *
 * <p><b>복사·폐기는 쓸 수 있는 코드에만 연다.</b> 기한이 지났거나 폐기했거나 횟수를 다 쓴
 * 코드는 남에게 줘 봐야 상대가 410 을 받을 뿐이고, 이미 무효인 것을 또 폐기할 일도 없다.
 *
 * <p>그래도 <b>줄 자체는 지우지 않고 보여 준다.</b> 서버가 폐기할 때 행을 지우지 않는 것과
 * 같은 이유다 — 누가 언제 발급했고 몇 명이 들어왔는지가 남아야 나중에 활동 로그(B4)와
 * 이어 붙일 수 있다.
 */
export default function InviteCodeRow({ invite, fresh, busy, onCopy, onRevoke }: Props) {
    const usable = invite.status === "ACTIVE";

    return (
        <div className={`col-row invite-row${fresh ? " invite-row--fresh" : ""}`}>
            <code className="invite-row__code">{invite.code}</code>

            <span className={`badge invite-status invite-status--${invite.status.toLowerCase()}`}>
                {INVITE_STATUS_LABEL[invite.status]}
            </span>

            <span className="badge badge--role">{ROLE_LABEL[invite.role]}</span>

            <span className="col-row__spacer" />

            <span className="invite-row__meta">{usesText(invite)}</span>
            <span className="invite-row__meta">{expiryText(invite)}</span>

            <button
                type="button"
                className="btn btn--outline btn--auto btn--sm"
                disabled={!usable}
                title={usable ? "코드 복사" : "쓸 수 없는 코드예요"}
                onClick={() => onCopy(invite)}
            >
                복사
            </button>

            <button
                type="button"
                className="btn btn--danger btn--auto btn--sm"
                disabled={!usable || busy}
                title={usable ? "이 코드를 더 못 쓰게 만들기" : "이미 쓸 수 없는 코드예요"}
                onClick={() => onRevoke(invite)}
            >
                폐기
            </button>
        </div>
    );
}

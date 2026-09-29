// src/components/project/ProjectInviteSection.tsx
import { useEffect, useState } from "react";
import { useInvites } from "@/hooks/useInvites";
import { copyText } from "@/utils/clipboard";
import InviteCodeRow from "./InviteCodeRow";
import InviteCreateForm from "./InviteCreateForm";
import type { InviteCreateReq, ProjectInvite, ProjectRole } from "@/types/project";
import "@/styles/invite.css";

type Props = {
    projectId: number;
    /** 이 프로젝트에서 내 역할. 코드 발급·폐기는 OWNER 만 할 수 있다. */
    myRole: ProjectRole;
};

/** 복사 알림이 떠 있는 시간 */
const COPIED_MS = 2000;

/**
 * 프로젝트 상세의 초대 코드 섹션. (QUESTIONS.md Q3 의 답변 C → 로드맵 B13)
 *
 * <p><b>OWNER 에게만 통째로 보인다.</b> 멤버 섹션과 달리 "목록만 보여 주기" 를 하지 않는다.
 * 코드는 그 자체가 프로젝트에 들어갈 수 있는 자격이라, 볼 수 있으면 쓸 수 있는 것과 같다.
 * 서버도 목록 조회부터 OWNER 로 막는다(P002).
 *
 * <p>화면에서 감추는 것은 편의일 뿐이고 실제 차단은 서버가 한다. API 를 직접 불러도 막힌다.
 */
export default function ProjectInviteSection({ projectId, myRole }: Props) {
    const canManage = myRole === "OWNER";

    const {
        state,
        actionError,
        busyInviteId,
        creating,
        create,
        revoke,
        clearActionError,
    } = useInvites(projectId, canManage);

    /** 방금 복사한 코드의 id. 잠깐 "복사했어요" 를 띄우는 데만 쓴다. */
    const [copiedId, setCopiedId] = useState<number | null>(null);

    /** 복사가 아예 안 된 경우. 조용히 실패하면 버튼이 고장 난 것처럼 보인다. */
    const [copyFailed, setCopyFailed] = useState(false);

    /** 방금 발급한 코드의 id. 목록에서 눈으로 찾게 해 준다. */
    const [freshId, setFreshId] = useState<number | null>(null);

    useEffect(() => {
        if (copiedId === null) return;
        const t = window.setTimeout(() => setCopiedId(null), COPIED_MS);
        return () => window.clearTimeout(t);
    }, [copiedId]);

    if (!canManage) return null;

    const handleCreate = async (req: InviteCreateReq): Promise<boolean> => {
        const created = await create(req);
        if (created) setFreshId(created.inviteId);
        return created !== null;
    };

    const handleCopy = async (invite: ProjectInvite) => {
        const ok = await copyText(invite.code);
        setCopyFailed(!ok);
        setCopiedId(ok ? invite.inviteId : null);
    };

    const handleRevoke = (invite: ProjectInvite) => {
        const ok = window.confirm(
            `초대 코드 ${invite.code} 를 폐기할까요?\n` +
                "이 코드로는 더 참여할 수 없게 됩니다. 이미 참여한 사람은 그대로 남습니다."
        );
        if (ok) void revoke(invite.inviteId);
    };

    const invites = state.status === "ready" ? state.invites : [];
    const activeCount = invites.filter((i) => i.status === "ACTIVE").length;

    return (
        <section className="section">
            <h2 className="section__title">
                초대 코드{state.status === "ready" && ` (쓸 수 있는 코드 ${activeCount}개)`}
            </h2>

            <p className="field__hint invite-lead">
                코드를 받은 사람이 <b>프로젝트 목록 화면에서 직접 참여</b>합니다. 메일 발송은 없습니다.
                코드로는 소유자 역할을 줄 수 없습니다.
            </p>

            <InviteCreateForm creating={creating} onCreate={handleCreate} />

            {actionError && (
                <div className="alert member-alert">
                    <span>{actionError}</span>
                    <button
                        type="button"
                        className="member-alert__close"
                        aria-label="닫기"
                        onClick={clearActionError}
                    >
                        ×
                    </button>
                </div>
            )}

            {copyFailed && (
                <div className="alert member-alert">
                    <span>복사하지 못했어요. 코드를 직접 선택해서 복사해 주세요.</span>
                    <button
                        type="button"
                        className="member-alert__close"
                        aria-label="닫기"
                        onClick={() => setCopyFailed(false)}
                    >
                        ×
                    </button>
                </div>
            )}

            {copiedId !== null && <p className="invite-copied">코드를 복사했어요.</p>}

            {state.status === "loading" && (
                <p className="state-text">초대 코드를 불러오는 중...</p>
            )}

            {state.status === "error" && <div className="alert">{state.message}</div>}

            {state.status === "ready" && invites.length === 0 && (
                <p className="field__hint">아직 발급한 코드가 없습니다.</p>
            )}

            {state.status === "ready" && invites.length > 0 && (
                <div className="col-list">
                    {invites.map((iv) => (
                        <InviteCodeRow
                            key={iv.inviteId}
                            invite={iv}
                            fresh={iv.inviteId === freshId}
                            busy={busyInviteId === iv.inviteId}
                            onCopy={(target) => void handleCopy(target)}
                            onRevoke={handleRevoke}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

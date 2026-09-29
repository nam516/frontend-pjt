// src/components/project/ProjectMemberSection.tsx
import { useEffect, useState } from "react";
import { me } from "@/api/auth";
import { useMembers } from "@/hooks/useMembers";
import MemberInviteForm from "./MemberInviteForm";
import MemberRow from "./MemberRow";
import type { ProjectMember, ProjectRole } from "@/types/project";
import "@/styles/member.css";

type Props = {
    projectId: number;
    /** 이 프로젝트에서 내 역할. OWNER 만 초대·변경·제거를 쓸 수 있다. */
    myRole: ProjectRole;
};

/**
 * 프로젝트 상세의 멤버 섹션.
 *
 * <p>OWNER 가 아니면 <b>목록만</b> 보인다. 화면에서 감추는 것은 편의일 뿐이고
 * 실제 차단은 서버가 한다(P002). API 를 직접 부르면 화면과 무관하게 막힌다.
 */
export default function ProjectMemberSection({ projectId, myRole }: Props) {
    const canManage = myRole === "OWNER";

    const {
        state,
        actionError,
        busyMemberId,
        inviting,
        invite,
        changeRole,
        remove,
        clearActionError,
    } = useMembers(projectId);

    /**
     * 내 사용자 id. 목록의 어느 줄이 나인지 표시하는 데만 쓴다.
     * 못 읽어도 목록은 그대로 그린다 — 없으면 "나" 배지가 안 붙을 뿐이다.
     */
    const [myUserId, setMyUserId] = useState<number | null>(null);

    useEffect(() => {
        let alive = true;
        void (async () => {
            try {
                const res = await me();
                if (alive && res.authenticated) setMyUserId(res.userId);
            } catch {
                /* 내가 누구인지 못 알아내도 멤버 목록 자체는 문제없이 보인다 */
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    const handleRemove = (member: ProjectMember) => {
        const name = member.userNm ?? member.loginId ?? `사용자 #${member.userId}`;
        const ok = window.confirm(
            `${name} 님을 이 프로젝트에서 뺄까요?\n이 사람에게 맡겨진 이슈의 담당자도 함께 비워집니다.`
        );
        if (ok) void remove(member.memberId);
    };

    const count = state.status === "ready" ? state.members.length : null;

    return (
        <section className="section">
            <h2 className="section__title">멤버{count !== null && ` (${count})`}</h2>

            {canManage && <MemberInviteForm inviting={inviting} onInvite={invite} />}

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

            {state.status === "loading" && <p className="state-text">멤버를 불러오는 중...</p>}

            {state.status === "error" && <div className="alert">{state.message}</div>}

            {state.status === "ready" && state.members.length === 0 && (
                <p className="field__hint">아직 멤버가 없습니다.</p>
            )}

            {state.status === "ready" && state.members.length > 0 && (
                <div className="col-list">
                    {state.members.map((m) => (
                        <MemberRow
                            key={m.memberId}
                            member={m}
                            isMe={myUserId !== null && m.userId === myUserId}
                            canManage={canManage}
                            busy={busyMemberId === m.memberId}
                            onChangeRole={(memberId, role) => void changeRole(memberId, role)}
                            onRemove={handleRemove}
                        />
                    ))}
                </div>
            )}

            <p className="field__hint" style={{ marginTop: 10 }}>
                {canManage
                    ? "이미 가입한 사람만 아이디로 초대할 수 있습니다. 소유자는 항상 한 명 이상 남아 있어야 합니다."
                    : "멤버를 초대하거나 역할을 바꾸려면 프로젝트 소유자 권한이 필요합니다."}
            </p>
        </section>
    );
}

// src/components/project/MemberRow.tsx
import Avatar from "@/components/issue/Avatar";
import { formatDate } from "@/utils/format";
import { memberDisplayName } from "@/utils/memberName";
import { ROLE_LABEL, ROLE_OPTIONS, type ProjectMember, type ProjectRole } from "@/types/project";

type Props = {
    member: ProjectMember;
    /** 지금 로그인한 사람의 줄인가 */
    isMe: boolean;
    /** 역할 변경·제거를 쓸 수 있는가 (OWNER 인가) */
    canManage: boolean;
    /** 이 줄에 요청이 나가 있는가 */
    busy: boolean;
    onChangeRole: (memberId: number, role: ProjectRole) => void;
    onRemove: (member: ProjectMember) => void;
};

/** 표시용 이름 — 담당자 선택기와 같은 규칙을 쓰려고 utils 로 옮겼다 (2026-09-27). */
const displayName = memberDisplayName;

/**
 * 멤버 한 줄.
 *
 * <p><b>자기 자신의 역할은 바꿀 수 없다.</b> 여기까지 올 수 있는 사람은 OWNER 뿐이므로
 * 자기 줄에서의 역할 변경은 예외 없이 "스스로 권한을 내리는 것"이 된다. 되돌릴 수단이
 * 없어지는 자리라 서버도 막고(P008) 화면도 아예 열지 않는다.
 *
 * <p><b>자기 자신을 빼는 버튼도 두지 않았다.</b> 다른 소유자가 있으면 서버는 허용하지만
 * (프로젝트에서 나가기), 그건 멤버 관리가 아니라 별도의 흐름이라 여기서는 내보이지 않는다.
 */
export default function MemberRow({
    member,
    isMe,
    canManage,
    busy,
    onChangeRole,
    onRemove,
}: Props) {
    const name = displayName(member);
    const editable = canManage && !isMe;

    return (
        <div className="col-row member-row">
            <Avatar
                name={member.userNm ?? member.loginId}
                size={30}
                emptyTitle="사용자 정보가 없는 멤버"
            />

            <div className="member-row__who">
                <span className="col-row__name">
                    {name}
                    {isMe && <span className="member-row__me">나</span>}
                </span>
                <span className="member-row__id">{member.loginId ?? "아이디 없음"}</span>
            </div>

            <span className="col-row__spacer" />

            <span className="member-row__joined">{formatDate(member.joinedDttm)} 합류</span>

            {editable ? (
                <select
                    className="field__input member-row__role"
                    aria-label={`${name} 의 역할`}
                    value={member.role}
                    disabled={busy}
                    onChange={(e) => onChangeRole(member.memberId, e.target.value as ProjectRole)}
                >
                    {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                            {ROLE_LABEL[r]}
                        </option>
                    ))}
                </select>
            ) : (
                <span className="badge badge--role">{ROLE_LABEL[member.role]}</span>
            )}

            {canManage && (
                <button
                    className="btn btn--danger btn--auto btn--sm"
                    disabled={busy || isMe}
                    title={isMe ? "자기 자신은 여기서 뺄 수 없어요" : "프로젝트에서 빼기"}
                    onClick={() => onRemove(member)}
                >
                    빼기
                </button>
            )}
        </div>
    );
}

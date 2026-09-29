// src/components/issue/AssigneeSelect.tsx
import { memberDisplayName } from "@/utils/memberName";
import type { ProjectMember } from "@/types/project";

type Props = {
    id: string;
    /** 프로젝트 멤버. 아직 못 읽었거나 읽다 실패했으면 null */
    members: ProjectMember[] | null;
    /** 멤버 목록을 못 읽은 이유. 있으면 선택기를 잠그고 이유를 보여 준다 */
    membersError: string | null;
    /** 지금 고른 담당자의 사용자 id. 없으면 null */
    value: number | null;
    /**
     * 지금 값의 이름 (서버가 준 assigneeName).
     * 지금 담당자가 멤버 목록에 없을 때 선택지를 하나 더 만들어 값을 지키는 데 쓴다.
     */
    currentName?: string | null;
    disabled?: boolean;
    onChange: (userId: number | null) => void;
};

const NONE = "";

/**
 * 담당자 선택기. 프로젝트 멤버 중에서 고른다.
 *
 * <p><b>지금 담당자가 멤버 목록에 없으면 선택지를 하나 더 만든다.</b> 제어 컴포넌트인
 * select 는 값에 맞는 option 이 없으면 첫 option("담당자 없음")을 보여 주는데, 그러면
 * 아무것도 안 건드렸는데 화면에는 "없음"으로 보이고, 사용자는 담당자가 이미 풀린 줄 안다.
 * (멤버를 빼면 서버가 담당을 함께 풀기 때문에 보통은 생기지 않는다. 멤버 목록을 읽은 뒤
 * 누군가 새로 들어와 담당자가 된 경우 정도다.)
 *
 * <p>멤버 목록을 못 읽었으면 선택기를 잠근다. 비어 있는 목록으로 열어 두면
 * "담당자 없음" 밖에 고를 수 없는데, 그걸 고르면 멀쩡한 담당자가 지워진다.
 */
export default function AssigneeSelect({
    id,
    members,
    membersError,
    value,
    currentName,
    disabled,
    onChange,
}: Props) {
    const loading = members == null && membersError == null;
    const locked = disabled || members == null;

    const missingCurrent =
        value != null && !(members ?? []).some((m) => m.userId === value);

    return (
        <>
            <select
                id={id}
                className="field__input"
                value={value == null ? NONE : String(value)}
                disabled={locked}
                onChange={(e) =>
                    onChange(e.target.value === NONE ? null : Number(e.target.value))
                }
            >
                <option value={NONE}>담당자 없음</option>
                {missingCurrent && (
                    <option value={String(value)}>
                        {currentName ?? `사용자 #${value}`}
                        {members != null ? " (멤버 목록에 없음)" : ""}
                    </option>
                )}
                {(members ?? []).map((m) => (
                    <option key={m.memberId} value={String(m.userId)}>
                        {memberDisplayName(m)}
                    </option>
                ))}
            </select>
            {loading && <p className="field__hint">멤버 목록을 불러오는 중이에요.</p>}
            {membersError && (
                <p className="field__hint">
                    {membersError} 담당자는 지금 바꿀 수 없어요.
                </p>
            )}
        </>
    );
}

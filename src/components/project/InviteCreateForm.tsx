// src/components/project/InviteCreateForm.tsx
import { useState, type FormEvent } from "react";
import {
    INVITE_ROLE_OPTIONS,
    ROLE_LABEL,
    type InvitableRole,
    type InviteCreateReq,
} from "@/types/project";

type Props = {
    creating: boolean;
    /** 성공하면 true. 그때만 입력값을 기본으로 되돌린다. */
    onCreate: (req: InviteCreateReq) => Promise<boolean>;
};

/**
 * 기한 선택지. 값이 빈 문자열이면 "기한 없음"이다.
 *
 * <p>서버는 기한·횟수를 <b>비우면 제한 없음</b>으로 받는다. "제한 없음"을 0 이나
 * 먼 미래 날짜로 표현하지 않기로 되어 있어(타입 주석 참고), 화면에서도 빈 값으로 보낸다.
 */
const EXPIRY_OPTIONS: { value: string; label: string }[] = [
    { value: "1", label: "1일" },
    { value: "7", label: "7일" },
    { value: "30", label: "30일" },
    { value: "", label: "기한 없음" },
];

const USES_OPTIONS: { value: string; label: string }[] = [
    { value: "1", label: "1명" },
    { value: "5", label: "5명" },
    { value: "10", label: "10명" },
    { value: "", label: "제한 없음" },
];

/** 기본값 — QUESTIONS.md Q14 의 "답변이 없으면" 쪽(A: 7일 · 횟수 무제한) */
const DEFAULT_EXPIRY = "7";
const DEFAULT_USES = "";

/**
 * 초대 코드 발급 폼.
 *
 * <p>역할 선택지에 <b>소유자가 없다.</b> 코드는 옮겨 적다가 새어 나갈 수 있는 값이고,
 * 소유권까지 코드로 넘어가면 되돌릴 방법이 없다. 서버도 P013 으로 막는다 —
 * 여기서 빼 두는 것은 "고를 수 없는 것을 고르게 하지 않는" 편의일 뿐이다.
 */
export default function InviteCreateForm({ creating, onCreate }: Props) {
    const [role, setRole] = useState<InvitableRole>("MEMBER");
    const [expiry, setExpiry] = useState<string>(DEFAULT_EXPIRY);
    const [uses, setUses] = useState<string>(DEFAULT_USES);

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (creating) return;

        const ok = await onCreate({
            role,
            // 빈 문자열은 보내지 않는다. 서버에서 "제한 없음"과 "0" 은 전혀 다른 뜻이다.
            expiresInDays: expiry ? Number(expiry) : undefined,
            maxUses: uses ? Number(uses) : undefined,
        });

        if (ok) {
            setRole("MEMBER");
            setExpiry(DEFAULT_EXPIRY);
            setUses(DEFAULT_USES);
        }
    };

    return (
        <form className="invite-form" onSubmit={submit}>
            <div className="invite-form__field">
                <label className="field__label" htmlFor="invite-code-role">
                    참여할 때 받을 역할
                </label>
                <select
                    id="invite-code-role"
                    className="field__input"
                    value={role}
                    disabled={creating}
                    onChange={(e) => setRole(e.target.value as InvitableRole)}
                >
                    {INVITE_ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                            {ROLE_LABEL[r]}
                        </option>
                    ))}
                </select>
            </div>

            <div className="invite-form__field">
                <label className="field__label" htmlFor="invite-code-expiry">
                    기한
                </label>
                <select
                    id="invite-code-expiry"
                    className="field__input"
                    value={expiry}
                    disabled={creating}
                    onChange={(e) => setExpiry(e.target.value)}
                >
                    {EXPIRY_OPTIONS.map((o) => (
                        <option key={o.label} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="invite-form__field">
                <label className="field__label" htmlFor="invite-code-uses">
                    쓸 수 있는 인원
                </label>
                <select
                    id="invite-code-uses"
                    className="field__input"
                    value={uses}
                    disabled={creating}
                    onChange={(e) => setUses(e.target.value)}
                >
                    {USES_OPTIONS.map((o) => (
                        <option key={o.label} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            </div>

            <button
                type="submit"
                className="btn btn--primary btn--auto btn--sm invite-form__submit"
                disabled={creating}
            >
                {creating ? "만드는 중..." : "코드 발급"}
            </button>
        </form>
    );
}

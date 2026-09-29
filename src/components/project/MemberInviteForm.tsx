// src/components/project/MemberInviteForm.tsx
import { useState, type FormEvent } from "react";
import { ROLE_LABEL, ROLE_OPTIONS, type ProjectRole } from "@/types/project";

type Props = {
    inviting: boolean;
    /** 성공하면 true 를 돌려준다. 그때만 입력칸을 비운다. */
    onInvite: (loginId: string, role: ProjectRole) => Promise<boolean>;
};

/**
 * 멤버 초대 폼 — 아이디로 직접 추가한다 (QUESTIONS.md Q3 의 A안).
 * 메일 발송이 없어 <b>이미 가입한 사람</b>만 넣을 수 있다.
 */
export default function MemberInviteForm({ inviting, onInvite }: Props) {
    const [loginId, setLoginId] = useState("");
    const [role, setRole] = useState<ProjectRole>("MEMBER");

    const submit = async (e: FormEvent) => {
        e.preventDefault();
        if (!loginId.trim() || inviting) return;

        const ok = await onInvite(loginId, role);
        if (ok) {
            setLoginId("");
            setRole("MEMBER");
        }
    };

    return (
        <form className="member-form" onSubmit={submit}>
            <div className="member-form__id">
                <label className="field__label" htmlFor="invite-login-id">
                    초대할 아이디
                </label>
                <input
                    id="invite-login-id"
                    className="field__input"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="loginId"
                    maxLength={120}
                    autoComplete="off"
                />
            </div>

            <div className="member-form__role">
                <label className="field__label" htmlFor="invite-role">
                    역할
                </label>
                <select
                    id="invite-role"
                    className="field__input"
                    value={role}
                    onChange={(e) => setRole(e.target.value as ProjectRole)}
                >
                    {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                            {ROLE_LABEL[r]}
                        </option>
                    ))}
                </select>
            </div>

            <button
                type="submit"
                className="btn btn--primary btn--auto btn--sm member-form__submit"
                disabled={inviting || !loginId.trim()}
            >
                {inviting ? "초대 중..." : "초대"}
            </button>
        </form>
    );
}

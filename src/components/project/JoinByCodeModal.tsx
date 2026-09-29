// src/components/project/JoinByCodeModal.tsx
import { useState, type FormEvent } from "react";
import { joinByInviteCode, previewInvite } from "@/api/invite";
import { describeApiError } from "@/api/common";
import { INVITE_ERROR_MESSAGES } from "@/constants/inviteMessages";
import {
    ROLE_LABEL,
    type InvitePreview,
    type InviteStatus,
    type ProjectSummary,
} from "@/types/project";
import "@/styles/invite.css";

type Props = {
    onClose: () => void;
    /** 참여에 성공했을 때. 목록 화면이 그 프로젝트로 보낸다. */
    onJoined: (project: ProjectSummary) => void;
    /** 이미 멤버인 코드였을 때. 참여시키지 않고 그 프로젝트를 열어 준다. */
    onOpen: (projectId: number) => void;
};

/**
 * 쓸 수 없는 상태를 오류 코드로 옮긴다.
 *
 * <p>미리보기는 <b>쓸 수 없는 코드여도 200</b> 이라 문장을 화면이 골라야 한다.
 * 그렇다고 여기에 문장을 새로 쓰면 같은 말이 두 군데에 생기므로,
 * 참여 요청이 막혔을 때 쓰는 표(INVITE_ERROR_MESSAGES)를 그대로 재사용한다.
 */
const STATUS_ERROR_CODE: Record<Exclude<InviteStatus, "ACTIVE">, string> = {
    EXPIRED: "P010",
    REVOKED: "P011",
    EXHAUSTED: "P012",
};

function blockedMessage(status: InviteStatus): string | null {
    if (status === "ACTIVE") return null;
    return INVITE_ERROR_MESSAGES[STATUS_ERROR_CODE[status]] ?? "지금은 쓸 수 없는 코드예요.";
}

/**
 * 사람이 입력한 코드를 서버가 저장한 형태로 맞춘다.
 *
 * <p>서버의 {@code InviteCodeGenerator.normalize} 와 <b>같은 규칙</b>이다.
 * 영문·숫자만 남기고 대문자로 올린다. 알파벳에 없는 글자(O, I, L)를 비슷한 글자로
 * 고쳐 주지는 않는다 — 고쳐 주면 잘못 본 코드가 <b>다른 프로젝트의 유효한 코드</b>가
 * 될 수 있다. 서버가 그렇게 하지 않기로 한 것을 화면이 앞질러 하면 안 된다.
 */
function normalizeCode(raw: string): string {
    return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

/**
 * 초대 코드로 프로젝트에 참여하기. (로드맵 B13)
 *
 * <p>확인을 <b>두 단계</b>로 나눈 이유가 있다. 코드만 보고는 어디에 들어가는지 알 수 없다.
 * 바로 참여시키면 "모르는 프로젝트에 들어와 있는" 상태가 되고, 스스로 나가는 기능은
 * 아직 없다(로드맵 B14). 그래서 먼저 미리보기로 <b>무슨 프로젝트에 어떤 역할로</b>
 * 들어가는지 보여 주고, 그 다음에 참여시킨다.
 */
export default function JoinByCodeModal({ onClose, onJoined, onOpen }: Props) {
    const [code, setCode] = useState("");
    const [preview, setPreview] = useState<InvitePreview | null>(null);
    const [busy, setBusy] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const canCheck = code.length > 0 && !busy;

    const handleCodeChange = (raw: string) => {
        setCode(normalizeCode(raw).slice(0, 32));
        // 코드를 고치면 앞서 본 미리보기는 다른 코드의 것이다. 남겨 두면
        // "A 코드를 확인하고 B 코드로 참여" 가 된다.
        setPreview(null);
        setErrorMsg(null);
    };

    const handleCheck = async (e: FormEvent) => {
        e.preventDefault();
        if (!canCheck) return;

        setErrorMsg(null);
        setBusy(true);
        try {
            setPreview(await previewInvite(code));
        } catch (err) {
            setPreview(null);
            setErrorMsg(
                describeApiError(err, INVITE_ERROR_MESSAGES, "코드를 확인하지 못했어요.")
            );
        } finally {
            setBusy(false);
        }
    };

    const handleJoin = async () => {
        if (!preview || busy) return;

        setErrorMsg(null);
        setBusy(true);
        try {
            onJoined(await joinByInviteCode(code));
        } catch (err) {
            setErrorMsg(describeApiError(err, INVITE_ERROR_MESSAGES, "참여하지 못했어요."));
        } finally {
            setBusy(false);
        }
    };

    const blocked = preview ? blockedMessage(preview.status) : null;

    // 이미 멤버면 상태를 따지지 않는다. 기한이 지난 코드로 눌러도 화면이 할 일은
    // "그 프로젝트를 여는 것" 하나뿐이고, 그건 참여 요청 없이 된다.
    const showOpen = preview?.alreadyMember === true;
    const canJoin = preview !== null && !showOpen && blocked === null;

    return (
        <div className="modal-backdrop" onMouseDown={onClose}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
                <h2 className="modal__title">초대 코드로 참여</h2>
                <p className="modal__desc">
                    받은 코드를 넣으면 <b>어느 프로젝트에 어떤 역할로</b> 들어가는지 먼저 보여 드립니다.
                </p>

                <form onSubmit={handleCheck}>
                    {errorMsg && <div className="alert">{errorMsg}</div>}

                    <div className="field">
                        <label className="field__label" htmlFor="join-invite-code">
                            초대 코드
                        </label>
                        <input
                            id="join-invite-code"
                            className="field__input field__input--mono"
                            value={code}
                            onChange={(e) => handleCodeChange(e.target.value)}
                            placeholder="AB2CD3EF"
                            maxLength={32}
                            autoComplete="off"
                            autoFocus
                        />
                        <p className="field__hint">
                            대소문자와 붙임표(-)는 알아서 맞춰 드립니다. 영문과 숫자만 남습니다.
                        </p>
                    </div>

                    {preview && (
                        <div className="invite-preview">
                            <div className="invite-preview__top">
                                <span className="badge badge--key">{preview.projectKey}</span>
                                <span className="badge badge--role">
                                    {ROLE_LABEL[preview.role]}
                                </span>
                            </div>

                            <p className="invite-preview__name">{preview.projectName}</p>

                            <p className="invite-preview__role">
                                {showOpen
                                    ? "이미 이 프로젝트의 멤버입니다."
                                    : `${ROLE_LABEL[preview.role]} 로 참여하게 됩니다.`}
                            </p>

                            {!showOpen && blocked && (
                                <p className="invite-preview__blocked">{blocked}</p>
                            )}
                        </div>
                    )}

                    <div className="modal__actions">
                        <button
                            type="button"
                            className="btn btn--outline"
                            onClick={onClose}
                            disabled={busy}
                        >
                            닫기
                        </button>

                        {preview === null && (
                            <button type="submit" className="btn btn--primary" disabled={!canCheck}>
                                {busy ? "확인 중..." : "코드 확인"}
                            </button>
                        )}

                        {showOpen && (
                            <button
                                type="button"
                                className="btn btn--primary"
                                onClick={() => onOpen(preview.projectId)}
                            >
                                프로젝트 열기
                            </button>
                        )}

                        {preview !== null && !showOpen && (
                            <button
                                type="button"
                                className="btn btn--primary"
                                onClick={() => void handleJoin()}
                                disabled={!canJoin || busy}
                            >
                                {busy ? "참여하는 중..." : "참여하기"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

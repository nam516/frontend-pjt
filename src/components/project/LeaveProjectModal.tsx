// src/components/project/LeaveProjectModal.tsx
import { useState } from "react";
import Modal from "@/components/common/Modal";
import { leaveProject } from "@/api/member";
import { describeApiError } from "@/api/common";

type Props = {
    projectId: number;
    projectName: string;
    onClose: () => void;
    /** 나가기에 성공했을 때. 부르는 쪽이 목록으로 보내고 사이드 메뉴를 새로 읽는다. */
    onLeft: () => void;
};

/** 나가기에서 서버가 막는 경우 */
const LEAVE_ERROR_MESSAGES: Record<string, string> = {
    P001: "프로젝트를 찾을 수 없어요. 이미 보관됐을 수 있어요.",
    P002: "이미 이 프로젝트의 멤버가 아니에요.",
    P007: "마지막 소유자는 나갈 수 없어요. 멤버·초대 탭에서 다른 사람을 소유자로 올린 다음 나가 주세요.",
};

/**
 * 프로젝트 나가기 확인 (로드맵 B14 / Q11 의 B).
 *
 * <p><b>프로젝트 이름을 똑같이 입력해야</b> 버튼이 열린다. 나가면 스스로 되돌릴 수 없고
 * (다시 초대받아야 한다), 보관·삭제처럼 한 번 누르면 끝나는 자리라 실수로 누르는 것을 막는다.
 */
export default function LeaveProjectModal({ projectId, projectName, onClose, onLeft }: Props) {
    const [typed, setTyped] = useState("");
    const [busy, setBusy] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const matches = typed.trim() === projectName.trim();

    const handleLeave = async () => {
        if (!matches || busy) return;
        setErrorMsg(null);
        setBusy(true);
        try {
            await leaveProject(projectId);
            onLeft();
        } catch (err) {
            setErrorMsg(describeApiError(err, LEAVE_ERROR_MESSAGES, "나가지 못했어요."));
            setBusy(false);
        }
    };

    return (
        <Modal
            title="프로젝트 나가기"
            description="나가면 이 프로젝트의 보드를 볼 수 없고, 내게 걸린 담당은 모두 풀립니다. 다시 들어오려면 초대를 받아야 합니다."
            onClose={onClose}
            footer={
                <>
                    <button className="btn btn--outline" onClick={onClose} disabled={busy}>
                        취소
                    </button>
                    <button
                        className="btn btn--danger"
                        onClick={handleLeave}
                        disabled={!matches || busy}
                    >
                        {busy ? "나가는 중..." : "나가기"}
                    </button>
                </>
            }
        >
            {errorMsg && <div className="alert">{errorMsg}</div>}

            <div className="field">
                <label className="field__label" htmlFor="leave-confirm">
                    확인을 위해 프로젝트 이름 <b>{projectName}</b> 을(를) 입력해 주세요
                </label>
                <input
                    id="leave-confirm"
                    className="field__input"
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") void handleLeave();
                    }}
                    autoFocus
                    autoComplete="off"
                />
            </div>
        </Modal>
    );
}

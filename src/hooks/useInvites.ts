// src/hooks/useInvites.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { createInvite, fetchInvites, revokeInvite } from "@/api/invite";
import { describeApiError } from "@/api/common";
import { INVITE_ERROR_MESSAGES } from "@/constants/inviteMessages";
import type { InviteCreateReq, ProjectInvite } from "@/types/project";

type State =
    | { status: "loading" }
    | { status: "ready"; invites: ProjectInvite[] }
    | { status: "error"; message: string };

/**
 * 프로젝트 초대 코드 목록과 발급·폐기. (QUESTIONS.md Q3 의 답변 C)
 *
 * <p>구조는 useMembers 와 일부러 똑같이 맞췄다. 바꾼 뒤에는 서버 응답 한 줄을 화면에
 * 끼워 넣지 않고 <b>목록을 다시 읽는다.</b> 이유가 멤버 때보다 오히려 강하다 —
 * 코드의 `status` 는 서버가 <b>조회 시점에 계산해서</b> 내려주는 값이라
 * (저장된 컬럼이 아니다) 화면이 스스로 만들어 낼 수 없다. 예를 들어 폐기 요청은
 * 204 만 돌려주므로, 다시 읽지 않으면 그 줄이 언제까지고 "사용 가능"으로 남는다.
 *
 * <p>목록 불러오기에 순번을 두는 이유도 같다. 프로젝트를 빠르게 옮겨 다니면
 * 이전 프로젝트의 응답이 나중에 도착해 <b>남의 프로젝트 초대 코드</b>를 그릴 수 있다.
 * 멤버 목록보다 더 나쁜 종류의 사고다.
 */
export function useInvites(projectId: number, enabled: boolean) {
    const [state, setState] = useState<State>({ status: "loading" });

    /** 목록을 못 읽은 것이 아니라 "방금 누른 것"이 막힌 경우. 목록은 그대로 두고 위에만 띄운다. */
    const [actionError, setActionError] = useState<string | null>(null);

    /** 지금 서버에 요청이 나가 있는 코드의 id. 그 줄만 잠근다. */
    const [busyInviteId, setBusyInviteId] = useState<number | null>(null);
    const [creating, setCreating] = useState(false);

    /**
     * 지금 화면이 어느 프로젝트의 코드를 그리고 있는지.
     * 이펙트 본문에서 곧바로 setState 하지 않으려고 렌더 도중에 되돌린다
     * (`react-hooks/set-state-in-effect`). useMembers·useBoard 와 같은 방식이다.
     */
    const [shownProjectId, setShownProjectId] = useState(projectId);
    if (shownProjectId !== projectId) {
        setShownProjectId(projectId);
        setState({ status: "loading" });
        setActionError(null);
        setBusyInviteId(null);
    }

    const loadSeq = useRef(0);

    const load = useCallback(async () => {
        // OWNER 가 아니면 부르지 않는다. 불러 봤자 서버가 P002 로 막고,
        // 그 오류를 화면에 띄우면 "권한이 없어요"가 이유 없이 떠 있게 된다.
        if (!enabled) return;

        const seq = ++loadSeq.current;
        try {
            const invites = await fetchInvites(projectId);
            if (seq !== loadSeq.current) return;
            setState({ status: "ready", invites });
        } catch (err) {
            if (seq !== loadSeq.current) return;
            setState({
                status: "error",
                message: describeApiError(
                    err,
                    INVITE_ERROR_MESSAGES,
                    "초대 코드를 불러오지 못했어요."
                ),
            });
        }
    }, [projectId, enabled]);

    useEffect(() => {
        void load();
    }, [load]);

    /** 코드 발급. 성공하면 새로 만들어진 코드를 돌려준다 — 화면이 그 줄을 강조하는 데 쓴다. */
    const create = useCallback(
        async (req: InviteCreateReq): Promise<ProjectInvite | null> => {
            setActionError(null);
            setCreating(true);
            try {
                const created = await createInvite(projectId, req);
                await load();
                return created;
            } catch (err) {
                setActionError(
                    describeApiError(err, INVITE_ERROR_MESSAGES, "코드를 만들지 못했어요.")
                );
                return null;
            } finally {
                setCreating(false);
            }
        },
        [projectId, load]
    );

    const revoke = useCallback(
        async (inviteId: number): Promise<void> => {
            setActionError(null);
            setBusyInviteId(inviteId);
            try {
                await revokeInvite(projectId, inviteId);
                await load();
            } catch (err) {
                setActionError(
                    describeApiError(err, INVITE_ERROR_MESSAGES, "코드를 폐기하지 못했어요.")
                );
            } finally {
                setBusyInviteId(null);
            }
        },
        [projectId, load]
    );

    const clearActionError = useCallback(() => setActionError(null), []);

    return {
        state,
        actionError,
        busyInviteId,
        creating,
        reload: load,
        create,
        revoke,
        clearActionError,
    };
}

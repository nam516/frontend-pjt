// src/hooks/useMembers.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { changeMemberRole, fetchMembers, inviteMember, removeMember } from "@/api/member";
import { describeApiError } from "@/api/common";
import { MEMBER_ERROR_MESSAGES } from "@/constants/memberMessages";
import type { ProjectMember, ProjectRole } from "@/types/project";

type State =
    | { status: "loading" }
    | { status: "ready"; members: ProjectMember[] }
    | { status: "error"; message: string };

/**
 * 프로젝트 멤버 목록과 초대·역할변경·제거.
 *
 * <p>바꾼 뒤에는 서버 응답 하나만 화면에 끼워 넣지 않고 <b>목록을 다시 읽는다.</b>
 * 정렬(역할 높은 순 → memberId 순)이 서버 규칙이라, 바뀐 한 줄만 갈아 끼우면
 * 화면의 순서가 서버와 어긋난다. 멤버 수는 많아야 수십이라 다시 읽어도 싸다.
 *
 * <p>목록 불러오기에 순번을 두는 이유는 보드와 같다. 프로젝트를 빠르게 옮겨 다니면
 * 이전 프로젝트의 응답이 나중에 도착해 남의 멤버 목록을 그릴 수 있다.
 */
export function useMembers(projectId: number) {
    const [state, setState] = useState<State>({ status: "loading" });

    /** 목록을 못 읽은 것이 아니라 "방금 누른 것"이 막힌 경우. 목록은 그대로 두고 위에만 띄운다. */
    const [actionError, setActionError] = useState<string | null>(null);

    /** 지금 서버에 요청이 나가 있는 멤버십 id. 그 줄만 잠근다. */
    const [busyMemberId, setBusyMemberId] = useState<number | null>(null);
    const [inviting, setInviting] = useState(false);

    /**
     * 지금 화면이 어느 프로젝트의 멤버를 그리고 있는지.
     * 이펙트 본문에서 곧바로 setState 하지 않으려고 렌더 도중에 되돌린다
     * (`react-hooks/set-state-in-effect`). useBoard 와 같은 방식이다.
     */
    const [shownProjectId, setShownProjectId] = useState(projectId);
    if (shownProjectId !== projectId) {
        setShownProjectId(projectId);
        setState({ status: "loading" });
        setActionError(null);
        setBusyMemberId(null);
    }

    const loadSeq = useRef(0);

    const load = useCallback(async () => {
        const seq = ++loadSeq.current;
        try {
            const members = await fetchMembers(projectId);
            if (seq !== loadSeq.current) return;
            setState({ status: "ready", members });
        } catch (err) {
            if (seq !== loadSeq.current) return;
            setState({
                status: "error",
                message: describeApiError(
                    err,
                    MEMBER_ERROR_MESSAGES,
                    "멤버 목록을 불러오지 못했어요."
                ),
            });
        }
    }, [projectId]);

    useEffect(() => {
        void load();
    }, [load]);

    /** 초대. 성공하면 true — 폼은 이 값을 보고 입력칸을 비운다. */
    const invite = useCallback(
        async (loginId: string, role: ProjectRole): Promise<boolean> => {
            setActionError(null);
            setInviting(true);
            try {
                await inviteMember(projectId, { loginId: loginId.trim(), role });
                await load();
                return true;
            } catch (err) {
                setActionError(
                    describeApiError(err, MEMBER_ERROR_MESSAGES, "초대하지 못했어요.")
                );
                return false;
            } finally {
                setInviting(false);
            }
        },
        [projectId, load]
    );

    const changeRole = useCallback(
        async (memberId: number, role: ProjectRole): Promise<void> => {
            setActionError(null);
            setBusyMemberId(memberId);
            try {
                await changeMemberRole(projectId, memberId, { role });
                await load();
            } catch (err) {
                setActionError(
                    describeApiError(err, MEMBER_ERROR_MESSAGES, "역할을 바꾸지 못했어요.")
                );
                // 셀렉트는 목록의 값을 그대로 보여주는 제어 컴포넌트라, 상태를 바꾸지
                // 않은 이 시점에 이미 원래 역할로 되돌아가 있다. 다시 읽을 필요가 없다.
            } finally {
                setBusyMemberId(null);
            }
        },
        [projectId, load]
    );

    const remove = useCallback(
        async (memberId: number): Promise<void> => {
            setActionError(null);
            setBusyMemberId(memberId);
            try {
                await removeMember(projectId, memberId);
                await load();
            } catch (err) {
                setActionError(
                    describeApiError(err, MEMBER_ERROR_MESSAGES, "멤버를 빼지 못했어요.")
                );
            } finally {
                setBusyMemberId(null);
            }
        },
        [projectId, load]
    );

    const clearActionError = useCallback(() => setActionError(null), []);

    return {
        state,
        actionError,
        busyMemberId,
        inviting,
        reload: load,
        invite,
        changeRole,
        remove,
        clearActionError,
    };
}

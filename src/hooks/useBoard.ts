// src/hooks/useBoard.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchBoard, moveIssue } from "@/api/issue";
import { extractApiErrorMsg } from "@/api/auth";
import { describeApiError } from "@/api/common";
import { ISSUE_ERROR_MESSAGES } from "@/constants/issueMessages";
import type { Board, IssueCard } from "@/types/issue";

type State =
    | { status: "loading" }
    | { status: "ready"; board: Board }
    | { status: "error"; message: string };

/**
 * 보드 상태와 이동 로직.
 *
 * <p>이동은 <b>낙관적 업데이트</b>로 처리한다. 카드를 놓는 즉시 화면을 바꾸고
 * 서버에는 뒤이어 요청한다. 응답을 기다렸다 그리면 드래그할 때마다
 * 화면이 멈춘 것처럼 느껴진다. 실패하면 서버 상태로 되돌린다.
 *
 * <p>드래그 중에는 리렌더 사이사이에 이벤트가 계속 들어온다. 그래서 최신 보드를
 * <b>ref 에도 같이</b> 들고 있는다. state 만 보면 아직 리렌더 전의 낡은 값을
 * 읽게 되고, 그 값으로 "앞뒤 이슈"를 계산하면 엉뚱한 자리로 이동한다.
 */
export function useBoard(projectId: number) {
    const [state, setState] = useState<State>({ status: "loading" });
    const [toast, setToast] = useState<string | null>(null);

    /**
     * 지금 화면이 어느 프로젝트의 보드를 그리고 있는지.
     *
     * <p>프로젝트가 바뀌면 이전 보드를 잠깐이라도 남겨두면 안 된다. 그렇다고
     * 이펙트 본문에서 곧바로 setState 하면 렌더가 한 번 더 연쇄로 돈다
     * (react-hooks/set-state-in-effect). 그래서 React 가 권하는 대로
     * <b>렌더 도중에</b> 상태를 되돌린다. 이 렌더의 결과는 버려지고 곧바로
     * 다시 렌더되므로 화면에 낡은 보드가 비치지 않는다.
     */
    const [shownProjectId, setShownProjectId] = useState(projectId);
    if (shownProjectId !== projectId) {
        setShownProjectId(projectId);
        setState({ status: "loading" });
    }

    /** 화면에 그려진 최신 보드. 항상 state 와 같은 값을 가리킨다. */
    const boardRef = useRef<Board | null>(null);

    const setBoard = useCallback((board: Board) => {
        boardRef.current = board;
        setState({ status: "ready", board });
    }, []);

    /** 이동 중에도 항상 최신 보드를 읽을 수 있게 열어 둔다. */
    const getBoard = useCallback(() => boardRef.current, []);

    /**
     * 몇 번째 불러오기인지.
     *
     * <p>프로젝트를 빠르게 옮겨 다니면 A 의 응답이 B 로 바꾼 뒤에 도착할 수 있다.
     * 그대로 두면 B 의 보드 자리에 A 의 보드가 그려진다. 자기 순번이 아직
     * 최신인지 확인하고서만 화면에 반영한다.
     */
    const loadSeq = useRef(0);

    const load = useCallback(async () => {
        const seq = ++loadSeq.current;
        try {
            const board = await fetchBoard(projectId);
            if (seq !== loadSeq.current) return; // 그 사이 더 새 요청이 떴다
            boardRef.current = board;
            setState({ status: "ready", board });
        } catch (err) {
            if (seq !== loadSeq.current) return;
            boardRef.current = null;
            setState({
                status: "error",
                message: extractApiErrorMsg(err, "보드를 불러오지 못했어요."),
            });
        }
    }, [projectId]);

    useEffect(() => {
        // ref 쓰기는 렌더를 일으키지 않으므로 이펙트에서 해도 된다.
        // "불러오는 중" 으로 되돌리는 것은 위 렌더 도중 조정이 이미 했다.
        boardRef.current = null;
        void (async () => {
            await load();
        })();
    }, [load]);

    /** 로컬 상태만 바꾼다. 드래그 중 미리보기에 쓰인다. */
    const applyLocalMove = useCallback(
        (issueId: number, toColumnId: number, toIndex: number) => {
            const current = boardRef.current;
            if (!current) return;

            const columns = current.columns.map((c) => ({ ...c, issues: [...c.issues] }));

            let moving: IssueCard | undefined;
            for (const c of columns) {
                const idx = c.issues.findIndex((i) => i.id === issueId);
                if (idx >= 0) {
                    moving = c.issues.splice(idx, 1)[0];
                    break;
                }
            }
            if (!moving) return;

            const target = columns.find((c) => c.id === toColumnId);
            if (!target) return;

            const index = Math.max(0, Math.min(toIndex, target.issues.length));
            target.issues.splice(index, 0, moving);

            setBoard({ ...current, columns });
        },
        [setBoard]
    );

    /**
     * 서버에 이동을 반영한다.
     * position 을 직접 보내지 않고 앞뒤 이슈 id 만 넘긴다 —
     * 동시에 옮기는 상황에서 클라이언트가 가진 좌표는 이미 낡았을 수 있다.
     *
     * <p>어느 컬럼의 몇 번째인지는 호출한 쪽이 아니라 여기서 ref 를 보고 정한다.
     * 화면에 실제로 그려진 자리와 서버에 보내는 자리가 어긋나지 않게 하기 위함이다.
     */
    const commitMove = useCallback(
        async (issueId: number) => {
            const current = boardRef.current;
            if (!current) return;

            const column = current.columns.find((c) => c.issues.some((i) => i.id === issueId));
            if (!column) return;

            const idx = column.issues.findIndex((i) => i.id === issueId);
            const prevIssueId = idx > 0 ? column.issues[idx - 1].id : null;
            const nextIssueId =
                idx >= 0 && idx < column.issues.length - 1 ? column.issues[idx + 1].id : null;

            try {
                await moveIssue(issueId, {
                    targetColumnId: column.id,
                    prevIssueId,
                    nextIssueId,
                });
            } catch (err) {
                setToast(describeApiError(err, ISSUE_ERROR_MESSAGES, "이동에 실패했어요. 되돌립니다."));
                await load(); // 서버 상태로 복구
            }
        },
        [load]
    );

    return {
        state,
        getBoard,
        reload: load,
        applyLocalMove,
        commitMove,
        toast,
        clearToast: () => setToast(null),
    };
}

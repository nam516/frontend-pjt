// src/hooks/useBoard.ts
import { useCallback, useEffect, useState } from "react";
import { fetchBoard, moveIssue } from "@/api/issue";
import { extractApiErrorMsg } from "@/api/auth";
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
 */
export function useBoard(projectId: number) {
    const [state, setState] = useState<State>({ status: "loading" });
    const [toast, setToast] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setState({ status: "ready", board: await fetchBoard(projectId) });
        } catch (err) {
            setState({
                status: "error",
                message: extractApiErrorMsg(err, "보드를 불러오지 못했어요."),
            });
        }
    }, [projectId]);

    useEffect(() => {
        setState({ status: "loading" });
        void load();
    }, [load]);

    /** 로컬 상태만 바꾼다. 드래그 중 미리보기에 쓰인다. */
    const applyLocalMove = useCallback(
        (issueId: number, toColumnId: number, toIndex: number) => {
            setState((prev) => {
                if (prev.status !== "ready") return prev;

                const columns = prev.board.columns.map((c) => ({ ...c, issues: [...c.issues] }));

                let moving: IssueCard | undefined;
                for (const c of columns) {
                    const idx = c.issues.findIndex((i) => i.id === issueId);
                    if (idx >= 0) {
                        moving = c.issues.splice(idx, 1)[0];
                        break;
                    }
                }
                if (!moving) return prev;

                const target = columns.find((c) => c.id === toColumnId);
                if (!target) return prev;

                const index = Math.max(0, Math.min(toIndex, target.issues.length));
                target.issues.splice(index, 0, moving);

                return { status: "ready", board: { ...prev.board, columns } };
            });
        },
        []
    );

    /**
     * 서버에 이동을 반영한다.
     * position 을 직접 보내지 않고 앞뒤 이슈 id 만 넘긴다 —
     * 동시에 옮기는 상황에서 클라이언트가 가진 좌표는 이미 낡았을 수 있다.
     */
    const commitMove = useCallback(
        async (issueId: number, toColumnId: number) => {
            let prevIssueId: number | null = null;
            let nextIssueId: number | null = null;

            setState((cur) => {
                if (cur.status === "ready") {
                    const col = cur.board.columns.find((c) => c.id === toColumnId);
                    if (col) {
                        const idx = col.issues.findIndex((i) => i.id === issueId);
                        prevIssueId = idx > 0 ? col.issues[idx - 1].id : null;
                        nextIssueId = idx >= 0 && idx < col.issues.length - 1 ? col.issues[idx + 1].id : null;
                    }
                }
                return cur;
            });

            try {
                await moveIssue(issueId, { targetColumnId: toColumnId, prevIssueId, nextIssueId });
            } catch (err) {
                setToast(extractApiErrorMsg(err, "이동에 실패했어요. 되돌립니다."));
                await load(); // 서버 상태로 복구
            }
        },
        [load]
    );

    return { state, reload: load, applyLocalMove, commitMove, toast, clearToast: () => setToast(null) };
}

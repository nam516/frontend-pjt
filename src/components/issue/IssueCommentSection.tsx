// src/components/issue/IssueCommentSection.tsx
import { useEffect, useState } from "react";
import { createComment, deleteComment, fetchComments, updateComment } from "@/api/comment";
import { describeApiError } from "@/api/common";
import { COMMENT_ERROR_MESSAGES } from "@/constants/commentMessages";
import CommentItem from "./CommentItem";
import type { IssueComment } from "@/types/issue";
import "@/styles/comment.css";

type Props = {
    issueId: number;
    /** 댓글을 쓸 수 있는가 (MEMBER 이상). 보드의 canEdit 과 같다. */
    canWrite: boolean;
};

type State =
    | { status: "loading" }
    | { status: "ready"; comments: IssueComment[] }
    | { status: "error"; message: string };

/**
 * 이슈 상세 아래의 댓글 (로드맵 B3). 목록 · 작성 · 수정(본인) · 삭제(본인 또는 소유자).
 *
 * <p>이슈 상세와 따로 불러온다. 댓글을 못 읽어도 이슈 내용은 보여야 하기 때문이다.
 */
export default function IssueCommentSection({ issueId, canWrite }: Props) {
    const [state, setState] = useState<State>({ status: "loading" });
    const [draft, setDraft] = useState("");
    const [busy, setBusy] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const comments = await fetchComments(issueId);
                if (alive) setState({ status: "ready", comments });
            } catch (err) {
                if (alive) {
                    setState({
                        status: "error",
                        message: describeApiError(err, COMMENT_ERROR_MESSAGES, "댓글을 불러오지 못했어요."),
                    });
                }
            }
        })();
        return () => {
            alive = false;
        };
    }, [issueId]);

    const comments = state.status === "ready" ? state.comments : [];
    const setComments = (next: IssueComment[]) => setState({ status: "ready", comments: next });

    const handleSubmit = async () => {
        const content = draft.trim();
        if (!content || busy) return;
        setErrorMsg(null);
        setBusy(true);
        try {
            const created = await createComment(issueId, content);
            setComments([...comments, created]);
            setDraft("");
        } catch (err) {
            setErrorMsg(describeApiError(err, COMMENT_ERROR_MESSAGES, "댓글을 남기지 못했어요."));
        } finally {
            setBusy(false);
        }
    };

    const handleSave = async (comment: IssueComment, content: string): Promise<boolean> => {
        setErrorMsg(null);
        setBusy(true);
        try {
            const saved = await updateComment(issueId, comment.id, content);
            setComments(comments.map((c) => (c.id === saved.id ? saved : c)));
            return true;
        } catch (err) {
            setErrorMsg(describeApiError(err, COMMENT_ERROR_MESSAGES, "댓글을 고치지 못했어요."));
            return false;
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async (comment: IssueComment) => {
        if (!window.confirm("이 댓글을 지울까요? 되돌릴 수 없습니다.")) return;
        setErrorMsg(null);
        setBusy(true);
        try {
            await deleteComment(issueId, comment.id);
            setComments(comments.filter((c) => c.id !== comment.id));
        } catch (err) {
            setErrorMsg(describeApiError(err, COMMENT_ERROR_MESSAGES, "댓글을 지우지 못했어요."));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="field cmt-section">
            <label className="field__label">
                댓글{state.status === "ready" && ` ${comments.length}`}
            </label>

            {errorMsg && <div className="alert">{errorMsg}</div>}

            {state.status === "loading" && <p className="cmt-section__note">불러오는 중...</p>}
            {state.status === "error" && <p className="cmt-section__note">{state.message}</p>}

            {state.status === "ready" && comments.length === 0 && (
                <p className="cmt-section__note">아직 댓글이 없습니다.</p>
            )}

            {comments.length > 0 && (
                <ul className="cmt-list">
                    {comments.map((c) => (
                        <CommentItem
                            key={c.id}
                            comment={c}
                            busy={busy}
                            onSave={handleSave}
                            onDelete={(target) => void handleDelete(target)}
                        />
                    ))}
                </ul>
            )}

            {canWrite ? (
                <div className="cmt-form">
                    <textarea
                        className="field__textarea cmt__input"
                        placeholder="댓글을 남겨 주세요. (Ctrl + Enter 로 등록)"
                        value={draft}
                        maxLength={4000}
                        disabled={busy || state.status !== "ready"}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) void handleSubmit();
                        }}
                    />
                    <div className="cmt__edit-actions">
                        <button
                            type="button"
                            className="btn btn--primary btn--auto btn--sm"
                            disabled={busy || !draft.trim() || state.status !== "ready"}
                            onClick={() => void handleSubmit()}
                        >
                            {busy ? "등록 중..." : "댓글 등록"}
                        </button>
                    </div>
                </div>
            ) : (
                <p className="cmt-section__note">뷰어는 댓글을 읽기만 할 수 있어요.</p>
            )}
        </div>
    );
}

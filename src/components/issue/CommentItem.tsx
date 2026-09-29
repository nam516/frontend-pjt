// src/components/issue/CommentItem.tsx
import { useState } from "react";
import Avatar from "./Avatar";
import { formatRelative } from "@/utils/format";
import type { IssueComment } from "@/types/issue";

type Props = {
    comment: IssueComment;
    busy: boolean;
    onSave: (comment: IssueComment, content: string) => Promise<boolean>;
    onDelete: (comment: IssueComment) => void;
};

/** 댓글 한 건. 고치기·지우기 버튼은 서버가 준 canEdit / canDelete 로만 연다. */
export default function CommentItem({ comment, busy, onSave, onDelete }: Props) {
    const [editing, setEditing] = useState(false);
    const [text, setText] = useState(comment.content);

    const save = async () => {
        const trimmed = text.trim();
        if (!trimmed) return;
        if (trimmed === comment.content) {
            setEditing(false);
            return;
        }
        if (await onSave(comment, trimmed)) setEditing(false);
    };

    return (
        <li className="cmt">
            <Avatar name={comment.authorName} size={28} emptyTitle="지워진 사용자" />

            <div className="cmt__body">
                <div className="cmt__head">
                    <span className="cmt__author">{comment.authorName ?? "지워진 사용자"}</span>
                    <span className="cmt__time" title={comment.fstRegDttm}>
                        {formatRelative(comment.fstRegDttm)}
                        {comment.edited && " · 수정됨"}
                    </span>
                    <span className="cmt__spacer" />
                    {!editing && comment.canEdit && (
                        <button
                            type="button"
                            className="cmt__action"
                            disabled={busy}
                            onClick={() => {
                                setText(comment.content);
                                setEditing(true);
                            }}
                        >
                            수정
                        </button>
                    )}
                    {!editing && comment.canDelete && (
                        <button
                            type="button"
                            className="cmt__action cmt__action--danger"
                            disabled={busy}
                            onClick={() => onDelete(comment)}
                        >
                            삭제
                        </button>
                    )}
                </div>

                {editing ? (
                    <>
                        <textarea
                            className="field__textarea cmt__input"
                            value={text}
                            maxLength={4000}
                            autoFocus
                            disabled={busy}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                // Ctrl/⌘ + Enter 로 저장. Enter 만으로는 줄바꿈이다.
                                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) void save();
                                if (e.key === "Escape") setEditing(false);
                            }}
                        />
                        <div className="cmt__edit-actions">
                            <button
                                type="button"
                                className="btn btn--outline btn--auto btn--sm"
                                disabled={busy}
                                onClick={() => setEditing(false)}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                className="btn btn--primary btn--auto btn--sm"
                                disabled={busy || !text.trim()}
                                onClick={() => void save()}
                            >
                                저장
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="cmt__content">{comment.content}</p>
                )}
            </div>
        </li>
    );
}

import { useEffect, useState } from "react";
import Modal from "@/components/common/Modal";
import Spinner from "@/components/common/Spinner";
import Avatar from "./Avatar";
import IssueTypeIcon from "./IssueTypeIcon";
import PriorityBadge from "./PriorityBadge";
import { deleteIssue, fetchIssue, updateIssue } from "@/api/issue";
import { extractApiErrorMsg } from "@/api/auth";
import {
    ISSUE_TYPES,
    ISSUE_TYPE_LABEL,
    PRIORITIES,
    PRIORITY_LABEL,
    type IssueDetail,
    type IssuePriority,
    type IssueType,
} from "@/types/issue";
import { formatDate, formatRelative } from "@/utils/format";

type Props = {
    issueId: number;
    canEdit: boolean;
    onClose: () => void;
    /** 저장 성공 — 보드를 갱신하기 위해 부모에게 알린다 */
    onSaved: (issue: IssueDetail) => void;
    onDeleted: (issueId: number) => void;
};

type State =
    | { status: "loading" }
    | { status: "ready"; issue: IssueDetail }
    | { status: "error"; message: string };

/** 이슈 상세. 읽기 모드로 열리고, 편집 권한이 있으면 수정 모드로 전환된다. */
export default function IssueDetailModal({
    issueId,
    canEdit,
    onClose,
    onSaved,
    onDeleted,
}: Props) {
    const [state, setState] = useState<State>({ status: "loading" });
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 편집 폼
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [issueType, setIssueType] = useState<IssueType>("TASK");
    const [priority, setPriority] = useState<IssuePriority>("MEDIUM");
    const [dueDate, setDueDate] = useState("");

    /** 서버 값으로 폼을 채운다. 수정 취소 시에도 같은 함수를 쓴다. */
    const resetForm = (issue: IssueDetail) => {
        setTitle(issue.title);
        setDescription(issue.description ?? "");
        setIssueType(issue.issueType);
        setPriority(issue.priority);
        setDueDate(issue.dueDate ?? "");
    };

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const issue = await fetchIssue(issueId);
                if (!alive) return;
                setState({ status: "ready", issue });
                resetForm(issue);
            } catch (err) {
                if (!alive) return;
                setState({
                    status: "error",
                    message: extractApiErrorMsg(err, "이슈를 불러오지 못했어요."),
                });
            }
        })();
        return () => {
            alive = false;
        };
    }, [issueId]);

    const handleSave = async () => {
        if (state.status !== "ready" || !title.trim()) return;

        setErrorMsg(null);
        setSaving(true);
        try {
            const saved = await updateIssue(issueId, {
                title: title.trim(),
                description: description.trim(),
                issueType,
                priority,
                // 값을 지우는 것과 "그대로 두는 것"은 다르다. 서버가 구분할 수 있게 플래그로 보낸다.
                dueDate: dueDate || undefined,
                clearDueDate: dueDate ? undefined : true,
            });
            setState({ status: "ready", issue: saved });
            resetForm(saved);
            setEditing(false);
            onSaved(saved);
        } catch (err) {
            setErrorMsg(extractApiErrorMsg(err, "저장하지 못했어요."));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("이 이슈를 삭제할까요? 되돌릴 수 없습니다.")) return;

        setErrorMsg(null);
        setSaving(true);
        try {
            await deleteIssue(issueId);
            onDeleted(issueId);
        } catch (err) {
            setErrorMsg(extractApiErrorMsg(err, "삭제하지 못했어요."));
            setSaving(false);
        }
    };

    const issue = state.status === "ready" ? state.issue : null;

    return (
        <Modal
            title={issue ? issue.issueKey : "이슈"}
            width={620}
            onClose={onClose}
            footer={
                issue && canEdit ? (
                    editing ? (
                        <>
                            <button
                                className="btn btn--outline"
                                onClick={() => {
                                    setEditing(false);
                                    setErrorMsg(null);
                                    resetForm(issue);
                                }}
                                disabled={saving}
                            >
                                취소
                            </button>
                            <button
                                className="btn btn--primary"
                                onClick={handleSave}
                                disabled={saving || !title.trim()}
                            >
                                {saving ? "저장 중..." : "저장"}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="btn btn--danger"
                                onClick={handleDelete}
                                disabled={saving}
                            >
                                삭제
                            </button>
                            <button className="btn btn--primary" onClick={() => setEditing(true)}>
                                수정
                            </button>
                        </>
                    )
                ) : undefined
            }
        >
            {state.status === "loading" && <Spinner />}

            {state.status === "error" && <div className="alert">{state.message}</div>}

            {issue && (
                <>
                    {errorMsg && <div className="alert">{errorMsg}</div>}

                    {editing ? (
                        <>
                            <div className="field">
                                <label className="field__label" htmlFor="d-title">제목</label>
                                <input
                                    id="d-title"
                                    className="field__input"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    maxLength={200}
                                    autoFocus
                                />
                            </div>

                            <div className="field-row">
                                <div className="field">
                                    <label className="field__label" htmlFor="d-type">종류</label>
                                    <select
                                        id="d-type"
                                        className="field__input"
                                        value={issueType}
                                        onChange={(e) => setIssueType(e.target.value as IssueType)}
                                    >
                                        {ISSUE_TYPES.map((t) => (
                                            <option key={t} value={t}>{ISSUE_TYPE_LABEL[t]}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="field">
                                    <label className="field__label" htmlFor="d-prio">우선순위</label>
                                    <select
                                        id="d-prio"
                                        className="field__input"
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value as IssuePriority)}
                                    >
                                        {PRIORITIES.map((p) => (
                                            <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="field">
                                <label className="field__label" htmlFor="d-due">마감일</label>
                                <input
                                    id="d-due"
                                    type="date"
                                    className="field__input"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                                <p className="field__hint">비워두면 마감일이 지워집니다.</p>
                            </div>

                            <div className="field">
                                <label className="field__label" htmlFor="d-desc">설명</label>
                                <textarea
                                    id="d-desc"
                                    className="field__textarea"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="idet__key">
                                <IssueTypeIcon type={issue.issueType} />
                                <span className="badge badge--key">{issue.issueKey}</span>
                                <PriorityBadge priority={issue.priority} />
                            </div>

                            <h3 className="page-title" style={{ fontSize: 20 }}>
                                {issue.title}
                            </h3>

                            <div className="idet__meta">
                                <span className="idet__label">상태</span>
                                <span className="idet__value">{issue.columnName}</span>

                                <span className="idet__label">종류</span>
                                <span className="idet__value">
                                    {ISSUE_TYPE_LABEL[issue.issueType]}
                                </span>

                                <span className="idet__label">우선순위</span>
                                <span className="idet__value">
                                    <PriorityBadge priority={issue.priority} />
                                    {PRIORITY_LABEL[issue.priority]}
                                </span>

                                <span className="idet__label">담당자</span>
                                <span className="idet__value">
                                    <Avatar name={issue.assigneeName} size={22} />
                                    {issue.assigneeName ?? "없음"}
                                </span>

                                <span className="idet__label">보고자</span>
                                <span className="idet__value">
                                    <Avatar name={issue.reporterName} size={22} />
                                    {issue.reporterName ?? "-"}
                                </span>

                                <span className="idet__label">마감일</span>
                                <span className="idet__value">
                                    {issue.dueDate ? formatDate(issue.dueDate) : "없음"}
                                </span>

                                <span className="idet__label">수정</span>
                                <span className="idet__value">
                                    {formatRelative(issue.lastModDttm)}
                                </span>
                            </div>

                            <div className="field" style={{ marginTop: 16 }}>
                                <label className="field__label">설명</label>
                                <p
                                    className={`idet__desc${
                                        issue.description ? "" : " idet__desc--empty"
                                    }`}
                                >
                                    {issue.description || "설명이 없습니다."}
                                </p>
                            </div>
                        </>
                    )}
                </>
            )}
        </Modal>
    );
}

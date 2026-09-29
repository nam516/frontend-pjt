import { useState } from "react";
import Modal from "@/components/common/Modal";
import AssigneeSelect from "./AssigneeSelect";
import { createIssue } from "@/api/issue";
import { describeApiError } from "@/api/common";
import { ISSUE_ERROR_MESSAGES } from "@/constants/issueMessages";
import { scheduleError } from "@/utils/schedule";
import {
    ISSUE_TYPES,
    ISSUE_TYPE_LABEL,
    PRIORITIES,
    PRIORITY_LABEL,
    type IssueDetail,
    type IssuePriority,
    type IssueType,
} from "@/types/issue";
import type { BoardColumn } from "@/types/issue";
import type { ProjectMember } from "@/types/project";

type Props = {
    projectId: number;
    columns: BoardColumn[];
    defaultColumnId: number;
    /** 담당자 선택지. 아직 못 읽었으면 null */
    members: ProjectMember[] | null;
    membersError: string | null;
    onClose: () => void;
    onCreated: (issue: IssueDetail) => void;
};

export default function IssueCreateModal({
    projectId,
    columns,
    defaultColumnId,
    members,
    membersError,
    onClose,
    onCreated,
}: Props) {
    // 이슈는 첫 컬럼(할 일)에서만 만든다(서버도 I005 로 막는다). 부르는 쪽이 첫 컬럼 id 를 넘긴다.
    const columnId = defaultColumnId;
    const columnName = columns.find((c) => c.id === columnId)?.name ?? "";
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [issueType, setIssueType] = useState<IssueType>("TASK");
    const [priority, setPriority] = useState<IssuePriority>("MEDIUM");
    const [startDate, setStartDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [assigneeId, setAssigneeId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const dateError = scheduleError(startDate, dueDate);
    const canSubmit = title.trim().length > 0 && !saving && !dateError;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        setErrorMsg(null);
        setSaving(true);
        try {
            onCreated(
                await createIssue(projectId, {
                    columnId,
                    title: title.trim(),
                    description: description.trim() || undefined,
                    issueType,
                    priority,
                    assigneeId: assigneeId ?? undefined,
                    startDate: startDate || undefined,
                    dueDate: dueDate || undefined,
                })
            );
        } catch (err) {
            setErrorMsg(describeApiError(err, ISSUE_ERROR_MESSAGES, "이슈를 만들지 못했어요."));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            title="새 이슈"
            description="이슈 키는 서버가 자동으로 매깁니다."
            width={520}
            onClose={onClose}
            footer={
                <>
                    <button className="btn btn--outline" onClick={onClose} disabled={saving}>
                        취소
                    </button>
                    <button
                        className="btn btn--primary"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                    >
                        {saving ? "만드는 중..." : "만들기"}
                    </button>
                </>
            }
        >
            <form onSubmit={handleSubmit}>
                {errorMsg && <div className="alert">{errorMsg}</div>}

                <div className="field">
                    <label className="field__label" htmlFor="title">제목</label>
                    <input
                        id="title"
                        className="field__input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="무엇을 해야 하나요?"
                        maxLength={200}
                        autoFocus
                    />
                </div>

                <div className="field-row">
                    <div className="field">
                        <label className="field__label" htmlFor="columnId">상태</label>
                        <input
                            id="columnId"
                            className="field__input"
                            value={columnName}
                            disabled
                            readOnly
                        />
                        <p className="field__hint">새 이슈는 첫 컬럼에서 시작합니다.</p>
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="issueType">종류</label>
                        <select
                            id="issueType"
                            className="field__input"
                            value={issueType}
                            onChange={(e) => setIssueType(e.target.value as IssueType)}
                        >
                            {ISSUE_TYPES.map((t) => (
                                <option key={t} value={t}>{ISSUE_TYPE_LABEL[t]}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="field-row">
                    <div className="field">
                        <label className="field__label" htmlFor="priority">우선순위</label>
                        <select
                            id="priority"
                            className="field__input"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as IssuePriority)}
                        >
                            {PRIORITIES.map((p) => (
                                <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="assigneeId">담당자</label>
                        <AssigneeSelect
                            id="assigneeId"
                            members={members}
                            membersError={membersError}
                            value={assigneeId}
                            disabled={saving}
                            onChange={setAssigneeId}
                        />
                    </div>
                </div>

                <div className="field-row">
                    <div className="field">
                        <label className="field__label" htmlFor="startDate">시작일</label>
                        <input
                            id="startDate"
                            type="date"
                            className="field__input"
                            value={startDate}
                            max={dueDate || undefined}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="dueDate">마감일</label>
                        <input
                            id="dueDate"
                            type="date"
                            className="field__input"
                            value={dueDate}
                            min={startDate || undefined}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                </div>
                {dateError && <p className="field__hint idate-error">{dateError}</p>}

                <div className="field">
                    <label className="field__label" htmlFor="description">설명</label>
                    <textarea
                        id="description"
                        className="field__textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="상세 내용을 적어주세요. (선택)"
                    />
                </div>
            </form>
        </Modal>
    );
}

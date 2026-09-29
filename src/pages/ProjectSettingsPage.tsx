// src/pages/ProjectSettingsPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { archiveProject, updateProject } from "@/api/project";
import { extractApiErrorMsg } from "@/api/auth";
import { useProjectContext } from "@/components/layout/projectContext";
import { useProjectNav } from "@/components/layout/projectNav";
import ColumnManager from "@/components/project/ColumnManager";
import LeaveProjectModal from "@/components/project/LeaveProjectModal";
import { formatDate } from "@/utils/format";

/**
 * 프로젝트 "설정" 탭 — 이름·설명 수정, 보관, 보드 컬럼, 정보.
 *
 * <p>2026-09-29: 보드 컬럼 관리(B5, ColumnManager)와 프로젝트 나가기(B14)를 여기에 붙였다.
 *
 * <p>옛 ProjectDetailPage 에서 멤버·초대 섹션(→ 멤버·초대 탭)과 "보드 열기"(→ 보드 탭)를
 * 뺀 나머지다. 수정·보관 동작과 문구는 그대로 옮겼다. 프로젝트는 ProjectLayout 이
 * 이미 읽어 두었으므로 여기서 다시 읽지 않는다.
 */
export default function ProjectSettingsPage() {
    const { project, setProject } = useProjectContext();
    const { reload: reloadNav } = useProjectNav();
    const navigate = useNavigate();

    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description ?? "");
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [leaveOpen, setLeaveOpen] = useState(false);

    const isOwner = project.myRole === "OWNER";

    const handleSave = async () => {
        setErrorMsg(null);
        setSaving(true);
        try {
            const updated = await updateProject(project.id, {
                name: name.trim(),
                description: description.trim(),
            });
            setProject(updated);
            setName(updated.name);
            setDescription(updated.description ?? "");
            setEditing(false);
            reloadNav(); // 사이드 메뉴의 이름도 바뀌어야 한다
        } catch (err) {
            setErrorMsg(extractApiErrorMsg(err, "저장하지 못했어요."));
        } finally {
            setSaving(false);
        }
    };

    const handleArchive = async () => {
        if (!window.confirm("이 프로젝트를 보관할까요? 목록에서 사라집니다.")) return;
        try {
            await archiveProject(project.id);
            reloadNav();
            navigate("/projects", { replace: true });
        } catch (err) {
            setErrorMsg(extractApiErrorMsg(err, "보관하지 못했어요."));
        }
    };

    return (
        <div className="app-main">
            {errorMsg && <div className="alert">{errorMsg}</div>}

            <section className="section">
                <div className="page-head">
                    <h2 className="section__title" style={{ margin: 0 }}>기본 정보</h2>
                    <span className="page-head__spacer" />
                    {isOwner && !editing && (
                        <>
                            <button
                                className="btn btn--outline btn--auto btn--sm"
                                onClick={() => setEditing(true)}
                            >
                                수정
                            </button>
                            <button
                                className="btn btn--danger btn--auto btn--sm"
                                onClick={handleArchive}
                            >
                                보관
                            </button>
                        </>
                    )}
                </div>

                {editing ? (
                    <>
                        <div className="field">
                            <label className="field__label" htmlFor="ps-name">프로젝트 이름</label>
                            <input
                                id="ps-name"
                                className="field__input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={100}
                            />
                        </div>
                        <div className="field">
                            <label className="field__label" htmlFor="ps-desc">설명</label>
                            <textarea
                                id="ps-desc"
                                className="field__textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={1000}
                            />
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                className="btn btn--outline btn--auto btn--sm"
                                onClick={() => {
                                    setEditing(false);
                                    setName(project.name);
                                    setDescription(project.description ?? "");
                                }}
                                disabled={saving}
                            >
                                취소
                            </button>
                            <button
                                className="btn btn--primary btn--auto btn--sm"
                                onClick={handleSave}
                                disabled={saving || !name.trim()}
                            >
                                {saving ? "저장 중..." : "저장"}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="col-list">
                        <div className="col-row">
                            <span className="col-row__name">이름</span>
                            <span className="col-row__spacer" />
                            <span className="app-user">{project.name}</span>
                        </div>
                        <div className="col-row">
                            <span className="col-row__name">설명</span>
                            <span className="col-row__spacer" />
                            <span className="app-user">{project.description || "설명이 없습니다."}</span>
                        </div>
                        <div className="col-row">
                            <span className="col-row__name">생성일</span>
                            <span className="col-row__spacer" />
                            <span className="app-user">{formatDate(project.fstRegDttm)}</span>
                        </div>
                    </div>
                )}
            </section>

            <ColumnManager
                projectId={project.id}
                columns={project.columns}
                canManage={isOwner}
                onChange={(columns) => setProject({ ...project, columns })}
            />

            <section className="section">
                <h2 className="section__title">프로젝트 나가기</h2>
                <div className="col-row">
                    <span className="app-user">
                        이 프로젝트에서 빠집니다. 내게 걸린 담당은 풀리고, 다시 들어오려면 초대를 받아야 합니다.
                        {isOwner && " 마지막 소유자는 나갈 수 없습니다."}
                    </span>
                    <span className="col-row__spacer" />
                    <button
                        className="btn btn--danger btn--auto btn--sm"
                        onClick={() => setLeaveOpen(true)}
                    >
                        나가기
                    </button>
                </div>
            </section>

            {leaveOpen && (
                <LeaveProjectModal
                    projectId={project.id}
                    projectName={project.name}
                    onClose={() => setLeaveOpen(false)}
                    onLeft={() => {
                        setLeaveOpen(false);
                        reloadNav(); // 사이드 메뉴에서도 빠져야 한다
                        navigate("/projects", { replace: true });
                    }}
                />
            )}
        </div>
    );
}

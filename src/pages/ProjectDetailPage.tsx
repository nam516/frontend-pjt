// src/pages/ProjectDetailPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { archiveProject, fetchProject, updateProject } from "@/api/project";
import { extractApiErrorMsg } from "@/api/auth";
import AppHeader from "@/components/project/AppHeader";
import {
    CATEGORY_LABEL,
    ROLE_LABEL,
    type ProjectDetail,
} from "@/types/project";
import { formatDate } from "@/utils/format";
import "@/styles/components.css";
import "@/styles/project.css";

type ViewState =
    | { status: "loading" }
    | { status: "ready"; project: ProjectDetail }
    | { status: "error"; message: string };

export default function ProjectDetailPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const [state, setState] = useState<ViewState>({ status: "loading" });
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const id = Number(projectId);

    useEffect(() => {
        (async () => {
            try {
                const project = await fetchProject(id);
                setState({ status: "ready", project });
                setName(project.name);
                setDescription(project.description ?? "");
            } catch (err) {
                setState({
                    status: "error",
                    message: extractApiErrorMsg(err, "프로젝트를 불러오지 못했어요."),
                });
            }
        })();
    }, [id]);

    const handleSave = async () => {
        setErrorMsg(null);
        setSaving(true);
        try {
            const updated = await updateProject(id, {
                name: name.trim(),
                description: description.trim(),
            });
            setState({ status: "ready", project: updated });
            setEditing(false);
        } catch (err) {
            setErrorMsg(extractApiErrorMsg(err, "저장하지 못했어요."));
        } finally {
            setSaving(false);
        }
    };

    const handleArchive = async () => {
        if (!window.confirm("이 프로젝트를 보관할까요? 목록에서 사라집니다.")) return;
        try {
            await archiveProject(id);
            navigate("/projects", { replace: true });
        } catch (err) {
            setErrorMsg(extractApiErrorMsg(err, "보관하지 못했어요."));
        }
    };

    return (
        <div className="app-shell">
            <AppHeader />

            <main className="app-main">
                {state.status === "loading" && <p className="state-text">불러오는 중...</p>}

                {state.status === "error" && (
                    <>
                        <div className="alert">{state.message}</div>
                        <button
                            className="btn btn--outline btn--auto btn--sm"
                            onClick={() => navigate("/projects")}
                        >
                            목록으로
                        </button>
                    </>
                )}

                {state.status === "ready" && (
                    <>
                        <button
                            className="btn btn--outline btn--auto btn--sm"
                            style={{ marginBottom: 20 }}
                            onClick={() => navigate("/projects")}
                        >
                            ← 목록
                        </button>

                        {errorMsg && <div className="alert">{errorMsg}</div>}

                        <div className="page-head">
                            <div style={{ flex: 1 }}>
                                <div className="proj-card__top">
                                    <span className="badge badge--key">
                                        {state.project.projectKey}
                                    </span>
                                    <span className="badge badge--role">
                                        {ROLE_LABEL[state.project.myRole]}
                                    </span>
                                </div>

                                {editing ? (
                                    <>
                                        <div className="field">
                                            <label className="field__label">프로젝트 이름</label>
                                            <input
                                                className="field__input"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                maxLength={100}
                                            />
                                        </div>
                                        <div className="field">
                                            <label className="field__label">설명</label>
                                            <textarea
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
                                                    setName(state.project.name);
                                                    setDescription(state.project.description ?? "");
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
                                    <>
                                        <h1 className="page-title">{state.project.name}</h1>
                                        <p className="page-desc">
                                            {state.project.description || "설명이 없습니다."}
                                        </p>
                                    </>
                                )}
                            </div>

                            {!editing && (
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        className="btn btn--primary btn--auto btn--sm"
                                        onClick={() => navigate(`/projects/${id}/board`)}
                                    >
                                        보드 열기
                                    </button>
                                    {state.project.myRole === "OWNER" && (
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
                            )}
                        </div>

                        <section className="section">
                            <h2 className="section__title">
                                보드 컬럼 ({state.project.columns.length})
                            </h2>
                            <div className="col-list">
                                {state.project.columns.map((c, i) => (
                                    <div key={c.id} className="col-row">
                                        <span className="col-row__order">{i + 1}</span>
                                        <span className="col-row__name">{c.name}</span>
                                        <span
                                            className={`badge badge--${c.category.toLowerCase()}`}
                                        >
                                            {CATEGORY_LABEL[c.category]}
                                        </span>
                                        <span className="col-row__spacer" />
                                        <span className="col-row__pos">pos {c.position}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="field__hint" style={{ marginTop: 10 }}>
                                보드에서 이 컬럼들 사이로 이슈 카드를 끌어 옮길 수 있습니다.
                            </p>
                        </section>

                        <section className="section">
                            <h2 className="section__title">정보</h2>
                            <div className="col-row">
                                <span className="col-row__name">생성일</span>
                                <span className="col-row__spacer" />
                                <span className="app-user">
                                    {formatDate(state.project.fstRegDttm)}
                                </span>
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

// src/pages/ProjectListPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyProjects } from "@/api/project";
import { extractApiErrorMsg } from "@/api/auth";
import AppHeader from "@/components/project/AppHeader";
import ProjectCreateModal from "@/components/project/ProjectCreateModal";
import { ROLE_LABEL, type ProjectSummary } from "@/types/project";
import { formatRelative } from "@/utils/format";
import "@/styles/components.css";
import "@/styles/project.css";

type ViewState =
    | { status: "loading" }
    | { status: "ready"; projects: ProjectSummary[] }
    | { status: "error"; message: string };

export default function ProjectListPage() {
    const navigate = useNavigate();
    const [state, setState] = useState<ViewState>({ status: "loading" });
    const [modalOpen, setModalOpen] = useState(false);

    const load = async () => {
        setState({ status: "loading" });
        try {
            setState({ status: "ready", projects: await fetchMyProjects() });
        } catch (err) {
            setState({
                status: "error",
                message: extractApiErrorMsg(err, "프로젝트 목록을 불러오지 못했어요."),
            });
        }
    };

    useEffect(() => {
        void load();
    }, []);

    return (
        <div className="app-shell">
            <AppHeader />

            <main className="app-main">
                <div className="page-head">
                    <div>
                        <h1 className="page-title">프로젝트</h1>
                        <p className="page-desc">내가 참여 중인 프로젝트 목록입니다.</p>
                    </div>
                    <span className="page-head__spacer" />
                    <button
                        className="btn btn--primary btn--auto btn--sm"
                        onClick={() => setModalOpen(true)}
                    >
                        + 새 프로젝트
                    </button>
                </div>

                {state.status === "loading" && <p className="state-text">불러오는 중...</p>}

                {state.status === "error" && (
                    <>
                        <div className="alert">{state.message}</div>
                        <button className="btn btn--outline btn--auto btn--sm" onClick={load}>
                            다시 시도
                        </button>
                    </>
                )}

                {state.status === "ready" && state.projects.length === 0 && (
                    <div className="empty">
                        <p className="empty__title">아직 프로젝트가 없습니다</p>
                        <p className="empty__desc">
                            첫 프로젝트를 만들면 보드 컬럼이 자동으로 준비됩니다.
                        </p>
                        <button
                            className="btn btn--primary btn--auto"
                            onClick={() => setModalOpen(true)}
                        >
                            프로젝트 만들기
                        </button>
                    </div>
                )}

                {state.status === "ready" && state.projects.length > 0 && (
                    <div className="proj-grid">
                        {state.projects.map((p) => (
                            <button
                                key={p.id}
                                className="proj-card"
                                onClick={() => navigate(`/projects/${p.id}`)}
                            >
                                <div className="proj-card__top">
                                    <span className="badge badge--key">{p.projectKey}</span>
                                    <span className="badge badge--role">{ROLE_LABEL[p.myRole]}</span>
                                </div>
                                <h2 className="proj-card__name">{p.name}</h2>
                                <p className="proj-card__desc">
                                    {p.description || "설명이 없습니다."}
                                </p>
                                <div className="proj-card__foot">
                                    {formatRelative(p.lastModDttm)} 수정
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </main>

            {modalOpen && (
                <ProjectCreateModal
                    onClose={() => setModalOpen(false)}
                    onCreated={(created) => {
                        setModalOpen(false);
                        navigate(`/projects/${created.id}`);
                    }}
                />
            )}
        </div>
    );
}

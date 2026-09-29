// src/pages/ProjectListPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyProjects } from "@/api/project";
import { extractApiErrorMsg } from "@/api/auth";
import { useProjectNav } from "@/components/layout/projectNav";
import ProjectCreateModal from "@/components/project/ProjectCreateModal";
import JoinByCodeModal from "@/components/project/JoinByCodeModal";
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
    const [joinOpen, setJoinOpen] = useState(false);
    const { reload: reloadNav } = useProjectNav();

    /** 프로젝트 안으로 들어간다. 들어가면 바로 보드가 열린다(Jira 와 같은 흐름). */
    const openProject = (projectId: number) => navigate(`/projects/${projectId}/board`);

    /**
     * 목록을 받아와 상태에 넣는다.
     *
     * <p>여기서 "불러오는 중" 으로 먼저 바꾸지 않는 이유는, 이 함수를 이펙트에서
     * 부르기 때문이다. 이펙트 본문에서 곧바로 setState 하면 렌더가 한 번 더
     * 연쇄로 돈다 (react-hooks/set-state-in-effect). 첫 진입은 이미
     * "불러오는 중" 으로 시작하므로 되돌릴 필요가 없고, 재시도할 때만
     * 아래 handleRetry 가 눌린 자리에서 바꿔 준다.
     */
    const load = async () => {
        try {
            const projects = await fetchMyProjects();
            setState({ status: "ready", projects });
        } catch (err) {
            setState({
                status: "error",
                message: extractApiErrorMsg(err, "프로젝트 목록을 불러오지 못했어요."),
            });
        }
    };

    const handleRetry = () => {
        setState({ status: "loading" });
        void load();
    };

    useEffect(() => {
        void (async () => {
            await load();
        })();
    }, []);

    return (
        <>
            <div className="app-main">
                <div className="page-head">
                    <div>
                        <h1 className="page-title">프로젝트</h1>
                        <p className="page-desc">내가 참여 중인 프로젝트 목록입니다.</p>
                    </div>
                    <span className="page-head__spacer" />
                    <button
                        className="btn btn--outline btn--auto btn--sm"
                        onClick={() => setJoinOpen(true)}
                    >
                        초대 코드로 참여
                    </button>
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
                        <button className="btn btn--outline btn--auto btn--sm" onClick={handleRetry}>
                            다시 시도
                        </button>
                    </>
                )}

                {state.status === "ready" && state.projects.length === 0 && (
                    <div className="empty">
                        <p className="empty__title">아직 프로젝트가 없습니다</p>
                        <p className="empty__desc">
                            첫 프로젝트를 만들면 보드 컬럼이 자동으로 준비됩니다.
                            초대 코드를 받으셨다면 그 코드로 참여할 수도 있습니다.
                        </p>
                        <div className="empty__actions">
                            <button
                                className="btn btn--outline btn--auto"
                                onClick={() => setJoinOpen(true)}
                            >
                                초대 코드로 참여
                            </button>
                            <button
                                className="btn btn--primary btn--auto"
                                onClick={() => setModalOpen(true)}
                            >
                                프로젝트 만들기
                            </button>
                        </div>
                    </div>
                )}

                {state.status === "ready" && state.projects.length > 0 && (
                    <div className="proj-grid">
                        {state.projects.map((p) => (
                            <button
                                key={p.id}
                                className="proj-card"
                                onClick={() => openProject(p.id)}
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
            </div>

            {joinOpen && (
                <JoinByCodeModal
                    onClose={() => setJoinOpen(false)}
                    onJoined={(joined) => {
                        setJoinOpen(false);
                        reloadNav(); // 사이드 메뉴에도 새 프로젝트가 떠야 한다
                        openProject(joined.id);
                    }}
                    onOpen={(projectId) => {
                        setJoinOpen(false);
                        openProject(projectId);
                    }}
                />
            )}

            {modalOpen && (
                <ProjectCreateModal
                    onClose={() => setModalOpen(false)}
                    onCreated={(created) => {
                        setModalOpen(false);
                        reloadNav();
                        openProject(created.id);
                    }}
                />
            )}
        </>
    );
}

// src/components/layout/AppLayout.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { fetchMyProjects } from "@/api/project";
import { extractApiErrorMsg } from "@/api/auth";
import ProjectCreateModal from "@/components/project/ProjectCreateModal";
import JoinByCodeModal from "@/components/project/JoinByCodeModal";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { ProjectNavContext, type ProjectNavState } from "./projectNav";
import "@/styles/components.css";
import "@/styles/project.css";

/**
 * 로그인 이후 화면의 틀: 상단 바 + 왼쪽 사이드 메뉴 + 본문.
 *
 * <p><b>레이아웃 라우트</b>로 쓴다(App.tsx). 화면을 옮겨도 이 컴포넌트는 그대로 남으므로
 * 사이드 메뉴의 프로젝트 목록을 화면마다 다시 읽지 않는다. 대신 목록이 바뀌는 일
 * (생성·참여·이름 변경·보관)이 생기면 그 화면이 {@code useProjectNav().reload()} 를 부른다.
 */
export default function AppLayout() {
    const navigate = useNavigate();
    const [nav, setNav] = useState<ProjectNavState>({ status: "loading" });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);

    // 이펙트에서 부르므로 "불러오는 중" 으로 먼저 바꾸지 않는다 (react-hooks/set-state-in-effect).
    const load = useCallback(async () => {
        try {
            const projects = await fetchMyProjects();
            setNav({ status: "ready", projects });
        } catch (err) {
            setNav({
                status: "error",
                message: extractApiErrorMsg(err, "프로젝트 목록을 불러오지 못했어요."),
            });
        }
    }, []);

    useEffect(() => {
        void (async () => {
            await load();
        })();
    }, [load]);

    const navValue = useMemo(() => ({ state: nav, reload: () => void load() }), [nav, load]);

    const goToProject = (projectId: number) => {
        setCreateOpen(false);
        setJoinOpen(false);
        void load();
        navigate(`/projects/${projectId}/board`);
    };

    return (
        <ProjectNavContext.Provider value={navValue}>
            <div className="shell">
                <TopBar onToggleSidebar={() => setSidebarOpen((v) => !v)} />

                <div className="shell__body">
                    <Sidebar
                        open={sidebarOpen}
                        onNavigate={() => setSidebarOpen(false)}
                        onCreateProject={() => {
                            setSidebarOpen(false);
                            setCreateOpen(true);
                        }}
                        onJoinByCode={() => {
                            setSidebarOpen(false);
                            setJoinOpen(true);
                        }}
                    />

                    {/* 좁은 화면에서 사이드 메뉴가 떠 있을 때 바깥을 누르면 닫는다 */}
                    {sidebarOpen && (
                        <div className="shell__scrim" onClick={() => setSidebarOpen(false)} />
                    )}

                    <main className="shell__main">
                        <Outlet />
                    </main>
                </div>
            </div>

            {createOpen && (
                <ProjectCreateModal
                    onClose={() => setCreateOpen(false)}
                    onCreated={(created) => goToProject(created.id)}
                />
            )}

            {joinOpen && (
                <JoinByCodeModal
                    onClose={() => setJoinOpen(false)}
                    onJoined={(joined) => goToProject(joined.id)}
                    onOpen={(projectId) => goToProject(projectId)}
                />
            )}
        </ProjectNavContext.Provider>
    );
}

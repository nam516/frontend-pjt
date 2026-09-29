// src/components/layout/ProjectLayout.tsx
import { useEffect, useState } from "react";
import { NavLink, Outlet, useMatch, useNavigate, useParams } from "react-router-dom";
import { fetchProject } from "@/api/project";
import { extractApiErrorMsg } from "@/api/auth";
import Spinner from "@/components/common/Spinner";
import { ROLE_LABEL, type ProjectDetail } from "@/types/project";
import type { ProjectContextValue } from "./projectContext";

type State =
    | { status: "loading" }
    | { status: "ready"; project: ProjectDetail }
    | { status: "error"; message: string };

const TABS = [
    { to: "board", label: "보드" },
    { to: "members", label: "멤버·초대" },
    { to: "settings", label: "설정" },
] as const;

/**
 * 프로젝트 안 화면의 틀: 프로젝트 머리글(키·이름·내 역할) + 가로 탭(보드 / 멤버·초대 / 설정).
 *
 * <p>프로젝트 정보는 여기서 <b>한 번만</b> 읽고 탭 화면에 Outlet context 로 내려 준다.
 * 탭을 오가도 다시 읽지 않는다. 보드는 자기 데이터를 따로 읽는다(기존 useBoard 그대로).
 */
export default function ProjectLayout() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const id = Number(projectId);

    // 보드 탭은 화면 높이를 꽉 채워야 컬럼이 세로로 길어지고 가로 스크롤이 보드 안에서만 생긴다.
    // 다른 탭(멤버·설정)은 평범하게 아래로 길어지며 본문 전체가 스크롤된다.
    const fill = useMatch("/projects/:projectId/board") !== null;

    // 프로젝트가 바뀌면(사이드 메뉴에서 다른 프로젝트 클릭) 이전 값을 버려야 한다.
    // 이펙트에서 "불러오는 중" 으로 되돌리지 않고, 어느 id 의 결과인지 함께 들고 있다가 비교한다.
    const [loaded, setLoaded] = useState<{ id: number; state: State } | null>(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const project = await fetchProject(id);
                if (alive) setLoaded({ id, state: { status: "ready", project } });
            } catch (err) {
                if (alive) {
                    setLoaded({
                        id,
                        state: {
                            status: "error",
                            message: extractApiErrorMsg(err, "프로젝트를 불러오지 못했어요."),
                        },
                    });
                }
            }
        })();
        return () => {
            alive = false;
        };
    }, [id]);

    const state: State = loaded && loaded.id === id ? loaded.state : { status: "loading" };

    if (state.status === "loading") return <Spinner />;

    if (state.status === "error") {
        return (
            <div className="app-main">
                <div className="alert">{state.message}</div>
                <button
                    className="btn btn--outline btn--auto btn--sm"
                    onClick={() => navigate("/projects")}
                >
                    목록으로
                </button>
            </div>
        );
    }

    const { project } = state;
    const context: ProjectContextValue = {
        project,
        setProject: (next) => setLoaded({ id, state: { status: "ready", project: next } }),
    };

    return (
        <div className={`proj-layout${fill ? " proj-layout--fill" : ""}`}>
            <div className="proj-head">
                <div className="proj-head__title">
                    <span className="badge badge--key">{project.projectKey}</span>
                    <h1 className="proj-head__name">{project.name}</h1>
                    <span className="badge badge--role">{ROLE_LABEL[project.myRole]}</span>
                </div>

                <nav className="proj-tabs" aria-label="프로젝트 메뉴">
                    {TABS.map((t) => (
                        <NavLink
                            key={t.to}
                            to={t.to}
                            className={({ isActive }) =>
                                `proj-tabs__tab${isActive ? " proj-tabs__tab--active" : ""}`
                            }
                        >
                            {t.label}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="proj-layout__body">
                <Outlet context={context} />
            </div>
        </div>
    );
}

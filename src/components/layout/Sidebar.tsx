// src/components/layout/Sidebar.tsx
import { NavLink, useMatch } from "react-router-dom";
import { useProjectNav } from "./projectNav";
import { GridIcon, PlusIcon, TicketIcon } from "./SidebarIcons";

type Props = {
    open: boolean;
    onNavigate: () => void;
    onCreateProject: () => void;
    onJoinByCode: () => void;
};

/** 프로젝트 아바타 색. 키 글자로 고르므로 같은 프로젝트는 늘 같은 색이다. */
function avatarTone(key: string): number {
    let sum = 0;
    for (const ch of key) sum += ch.charCodeAt(0);
    return (sum % 6) + 1;
}

/**
 * 왼쪽 사이드 메뉴 — 전체 프로젝트 / 내 프로젝트 목록 / 초대 코드로 참여.
 *
 * <p>프로젝트 안의 화면(보드·멤버·설정)은 여기 두지 않고 본문 위 탭으로 뺐다.
 * 지금 Jira(2025 개편)와 같은 배치다. 사이드 메뉴는 "어느 프로젝트", 탭은 "그 안의 무엇".
 */
export default function Sidebar({ open, onNavigate, onCreateProject, onJoinByCode }: Props) {
    const { state, reload } = useProjectNav();

    // 레이아웃은 자식 라우트의 params 를 못 보므로 주소로 지금 프로젝트를 알아낸다.
    const match = useMatch("/projects/:projectId/*");
    const currentId = match ? Number(match.params.projectId) : null;

    const count = state.status === "ready" ? state.projects.length : null;

    return (
        <aside className={`sidebar${open ? " sidebar--open" : ""}`}>
            <nav className="sidebar__nav">
                <NavLink
                    to="/projects"
                    end
                    className={({ isActive }) =>
                        `sidebar__item${isActive ? " sidebar__item--active" : ""}`
                    }
                    onClick={onNavigate}
                >
                    <span className="sidebar__icon">
                        <GridIcon />
                    </span>
                    전체 프로젝트
                </NavLink>
            </nav>

            <div className="sidebar__section">
                <div className="sidebar__section-head">
                    <span className="sidebar__label">내 프로젝트</span>
                    {count !== null && <span className="sidebar__count">{count}</span>}
                    <span className="sidebar__spacer" />
                    <button
                        type="button"
                        className="sidebar__icon-btn"
                        title="새 프로젝트"
                        aria-label="새 프로젝트"
                        onClick={onCreateProject}
                    >
                        <PlusIcon size={14} />
                    </button>
                </div>

                {state.status === "loading" && <p className="sidebar__note">불러오는 중...</p>}

                {state.status === "error" && (
                    <p className="sidebar__note">
                        목록을 못 읽었어요.{" "}
                        <button type="button" className="sidebar__retry" onClick={reload}>
                            다시 시도
                        </button>
                    </p>
                )}

                {state.status === "ready" && state.projects.length === 0 && (
                    <button type="button" className="sidebar__empty" onClick={onCreateProject}>
                        첫 프로젝트 만들기
                    </button>
                )}

                {state.status === "ready" &&
                    state.projects.map((p) => (
                        <NavLink
                            key={p.id}
                            to={`/projects/${p.id}/board`}
                            className={`sidebar__item sidebar__project${
                                p.id === currentId ? " sidebar__item--active" : ""
                            }`}
                            title={p.name}
                            onClick={onNavigate}
                        >
                            <span className={`pav pav--${avatarTone(p.projectKey)}`}>
                                {p.projectKey.slice(0, 2)}
                            </span>
                            <span className="sidebar__text">
                                <span className="sidebar__name">{p.name}</span>
                                <span className="sidebar__key">{p.projectKey}</span>
                            </span>
                        </NavLink>
                    ))}
            </div>

            <div className="sidebar__foot">
                <button type="button" className="sidebar__join" onClick={onJoinByCode}>
                    <span className="sidebar__join-icon">
                        <TicketIcon />
                    </span>
                    <span className="sidebar__text">
                        <span className="sidebar__join-title">초대 코드로 참여</span>
                        <span className="sidebar__join-desc">받은 코드를 붙여 넣으세요</span>
                    </span>
                </button>
            </div>
        </aside>
    );
}

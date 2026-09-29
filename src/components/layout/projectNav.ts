// src/components/layout/projectNav.ts
import { createContext, useContext } from "react";
import type { ProjectSummary } from "@/types/project";

export type ProjectNavState =
    | { status: "loading" }
    | { status: "ready"; projects: ProjectSummary[] }
    | { status: "error"; message: string };

export type ProjectNavValue = {
    /** 사이드 메뉴의 "내 프로젝트" 목록 */
    state: ProjectNavState;
    /**
     * 목록을 다시 읽는다. 프로젝트를 만들거나·참여하거나·이름을 바꾸거나·보관한 뒤에 부른다.
     * 사이드 메뉴는 화면을 옮겨도 다시 그려지지 않으므로(레이아웃 라우트) 스스로는 모른다.
     */
    reload: () => void;
};

export const ProjectNavContext = createContext<ProjectNavValue | null>(null);

/** AppLayout 안에서만 쓴다. 밖에서 부르면 조용히 넘어가지 않고 바로 알 수 있게 던진다. */
export function useProjectNav(): ProjectNavValue {
    const value = useContext(ProjectNavContext);
    if (!value) throw new Error("useProjectNav 는 AppLayout 안에서만 쓸 수 있습니다.");
    return value;
}

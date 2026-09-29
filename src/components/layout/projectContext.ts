// src/components/layout/projectContext.ts
import { useOutletContext } from "react-router-dom";
import type { ProjectDetail } from "@/types/project";

/** ProjectLayout 이 탭 화면(보드·멤버·설정)에 내려 주는 값 */
export type ProjectContextValue = {
    project: ProjectDetail;
    /** 설정 화면에서 이름·설명을 고친 뒤 머리글을 바로 바꾸기 위해 쓴다 */
    setProject: (project: ProjectDetail) => void;
};

export function useProjectContext(): ProjectContextValue {
    return useOutletContext<ProjectContextValue>();
}

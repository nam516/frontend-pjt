// src/pages/ProjectMembersPage.tsx
import { useProjectContext } from "@/components/layout/projectContext";
import ProjectInviteSection from "@/components/project/ProjectInviteSection";
import ProjectMemberSection from "@/components/project/ProjectMemberSection";

/**
 * 프로젝트 "멤버·초대" 탭. 옛 프로젝트 상세 화면에 있던 두 섹션을 그대로 옮겼다.
 * (초대 코드 섹션은 여전히 OWNER 에게만 보인다 — 컴포넌트가 스스로 판단한다)
 */
export default function ProjectMembersPage() {
    const { project } = useProjectContext();

    return (
        <div className="app-main">
            <ProjectInviteSection projectId={project.id} myRole={project.myRole} />
            <ProjectMemberSection projectId={project.id} myRole={project.myRole} />
        </div>
    );
}

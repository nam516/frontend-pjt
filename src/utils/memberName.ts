// src/utils/memberName.ts
import type { ProjectMember } from "@/types/project";

/**
 * 멤버를 화면에 보일 이름. 사용자 행이 지워졌으면 이름·아이디가 없을 수 있다.
 *
 * <p>멤버 목록(MemberRow)과 담당자 선택기(AssigneeSelect)가 <b>같은 사람을 같은 이름으로</b>
 * 보여야 해서 한 곳에 둔다. 한쪽만 바꾸면 "멤버 목록의 홍길동"과 "선택기의 hong" 이 어긋난다.
 */
export function memberDisplayName(member: ProjectMember): string {
    return member.userNm ?? member.loginId ?? `사용자 #${member.userId}`;
}

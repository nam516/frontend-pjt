// src/utils/branchName.ts
import type { IssueType } from "@/types/issue";

/**
 * 이슈로 git 브랜치 이름을 만든다 (로드맵 B16).
 *
 * <p>모양은 {@code <접두사>/<이슈키>-<제목 슬러그>} 다. 예: {@code feature/PJT-12-login-form}
 *
 * <p><b>이슈 키는 대소문자를 그대로 둔다.</b> 서버가 대문자로 정규화해 저장하고
 * (프로젝트 키는 {@code ^[A-Za-z][A-Za-z0-9]{1,9}$} + 대문자화), Jira·GitHub 연동도
 * 브랜치 이름 속 {@code PJT-12} 를 대문자 그대로 찾는다. 소문자로 바꾸면 이슈와 이어지지 않는다.
 *
 * <p>이 파일은 화면과 무관한 순수 함수만 둔다. B6 에서 Vitest 로 덮기 쉽게 하기 위해서다.
 */

export const BRANCH_PREFIXES = ["feature", "fix", "hotfix", "refactor", "chore"] as const;

export type BranchPrefix = (typeof BRANCH_PREFIXES)[number];

/** 이슈 종류에 따른 기본 접두사. 버그만 fix, 나머지는 feature. */
export const DEFAULT_BRANCH_PREFIX: Record<IssueType, BranchPrefix> = {
    TASK: "feature",
    STORY: "feature",
    BUG: "fix",
};

/** 제목 슬러그의 최대 길이. 이슈 키·접두사는 여기에 포함하지 않는다. */
export const SLUG_MAX_LENGTH = 40;

/**
 * 제목을 브랜치에 쓸 수 있는 조각으로 바꾼다.
 *
 * <ul>
 *   <li>악센트 문자는 기본 글자로 푼다 ({@code café} → {@code cafe}).</li>
 *   <li>소문자 영숫자만 남기고, 나머지 글자가 이어진 구간은 {@code -} 하나로 바꾼다.</li>
 *   <li><b>한글은 음차하지 않고 빠진다.</b> 음차 규칙을 넣으면 사람마다 기대하는 표기가
 *       달라 오히려 헷갈린다. 제목이 전부 한글이면 빈 문자열이 되고, 브랜치는 이슈 키만 남는다.</li>
 *   <li>{@link SLUG_MAX_LENGTH} 를 넘으면 자른다. 가능하면 단어 경계({@code -})에서 자르되,
 *       그러면 절반도 안 남는 경우에만 글자 단위로 자른다.</li>
 * </ul>
 */
export function slugifyTitle(title: string, maxLength: number = SLUG_MAX_LENGTH): string {
    const slug = title
        .normalize("NFKD")
        .replace(/\p{M}/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    if (slug.length <= maxLength) return slug;

    const cut = slug.slice(0, maxLength);
    const lastDash = cut.lastIndexOf("-");
    const trimmed = lastDash >= maxLength / 2 ? cut.slice(0, lastDash) : cut;
    return trimmed.replace(/-+$/g, "");
}

/**
 * 브랜치 이름 전체를 만든다.
 *
 * <p>이슈 키에 혹시 git ref 에 못 쓰는 글자가 섞여 와도 깨진 이름이 나오지 않도록
 * 영숫자·{@code -}·{@code _} 외의 글자는 걸러낸다. (지금 서버 규칙으로는 걸러질 글자가 없다)
 */
export function buildBranchName(prefix: BranchPrefix, issueKey: string, title: string): string {
    const key = issueKey.replace(/[^A-Za-z0-9_-]/g, "");
    const slug = slugifyTitle(title);
    return slug ? `${prefix}/${key}-${slug}` : `${prefix}/${key}`;
}

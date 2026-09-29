// src/components/issue/BranchNameBox.tsx
import { useEffect, useState } from "react";
import { copyText } from "@/utils/clipboard";
import {
    BRANCH_PREFIXES,
    DEFAULT_BRANCH_PREFIX,
    buildBranchName,
    type BranchPrefix,
} from "@/utils/branchName";
import type { IssueType } from "@/types/issue";

type Props = {
    issueKey: string;
    title: string;
    issueType: IssueType;
};

/** "복사했어요" 를 보여 주는 시간 */
const COPIED_MS = 2000;

type Copied = "name" | "command" | null;

/**
 * 이슈 상세(읽기 모드)의 git 브랜치 이름 줄 (로드맵 B16).
 *
 * <p>접두사는 이슈 종류로 기본값을 고르고(버그 → fix, 나머지 → feature) 그 자리에서 바꿀 수 있다.
 * 고른 접두사는 <b>저장하지 않는다.</b> 복사해 갈 문자열을 만드는 도구일 뿐이라 서버에 남길 값이 없다.
 *
 * <p>이슈 종류가 바뀌면 기본 접두사도 달라져야 한다. 이펙트로 state 를 되돌리는 대신
 * 부르는 쪽이 {@code key={issueType}} 으로 컴포넌트를 새로 만들게 했다
 * (이펙트 안 setState 는 lint 규칙 {@code react-hooks/set-state-in-effect} 에 걸린다).
 *
 * <p>권한과 무관하게 누구에게나 보인다. 뷰어도 코드를 받아 작업할 수 있다.
 */
export default function BranchNameBox({ issueKey, title, issueType }: Props) {
    const [prefix, setPrefix] = useState<BranchPrefix>(DEFAULT_BRANCH_PREFIX[issueType]);
    const [copied, setCopied] = useState<Copied>(null);
    const [copyFailed, setCopyFailed] = useState(false);

    useEffect(() => {
        if (copied === null) return;
        const t = window.setTimeout(() => setCopied(null), COPIED_MS);
        return () => window.clearTimeout(t);
    }, [copied]);

    const branch = buildBranchName(prefix, issueKey, title);
    const command = `git checkout -b ${branch}`;

    const handleCopy = async (what: Exclude<Copied, null>) => {
        const ok = await copyText(what === "name" ? branch : command);
        setCopyFailed(!ok);
        setCopied(ok ? what : null);
    };

    return (
        <div className="field branch-box">
            <label className="field__label" htmlFor="branch-prefix">
                git 브랜치
            </label>

            <div className="branch-box__row">
                <select
                    id="branch-prefix"
                    className="field__input branch-box__prefix"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value as BranchPrefix)}
                    aria-label="브랜치 접두사"
                >
                    {BRANCH_PREFIXES.map((p) => (
                        <option key={p} value={p}>
                            {p}/
                        </option>
                    ))}
                </select>

                <code className="branch-box__name" title={branch}>
                    {branch}
                </code>

                <button
                    type="button"
                    className="btn btn--outline btn--auto btn--sm"
                    onClick={() => void handleCopy("name")}
                >
                    {copied === "name" ? "복사했어요" : "이름 복사"}
                </button>

                <button
                    type="button"
                    className="btn btn--outline btn--auto btn--sm"
                    title={command}
                    onClick={() => void handleCopy("command")}
                >
                    {copied === "command" ? "복사했어요" : "명령 복사"}
                </button>
            </div>

            {copyFailed ? (
                <p className="field__hint branch-box__error">
                    복사하지 못했어요. 이름을 직접 선택해서 복사해 주세요.
                </p>
            ) : (
                <p className="field__hint">
                    제목의 영문·숫자만 이름에 들어갑니다. 한글 제목이면 이슈 키만 남습니다.
                </p>
            )}
        </div>
    );
}

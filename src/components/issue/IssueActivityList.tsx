// src/components/issue/IssueActivityList.tsx
import { useEffect, useState } from "react";
import { fetchIssueActivities } from "@/api/activity";
import { describeApiError } from "@/api/common";
import { ISSUE_ERROR_MESSAGES } from "@/constants/issueMessages";
import { describeActivity } from "@/utils/activityText";
import { formatRelative } from "@/utils/format";
import Avatar from "./Avatar";
import type { Activity } from "@/types/issue";
import "@/styles/activity.css";

type Props = {
    issueId: number;
    /**
     * 이슈가 저장될 때마다 바뀌는 값(수정 시각). 바뀌면 다시 읽는다.
     * 상세 모달에서 수정한 직후 활동 탭을 열면 방금 바꾼 것이 보여야 한다.
     */
    version: string;
};

type State =
    | { status: "loading" }
    | { status: "ready"; items: Activity[] }
    | { status: "error"; message: string };

/** 이슈 상세의 "활동" 탭 (로드맵 B4). 최신이 위. */
export default function IssueActivityList({ issueId, version }: Props) {
    const [loaded, setLoaded] = useState<{ key: string; state: State } | null>(null);
    const key = `${issueId}:${version}`;

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const items = await fetchIssueActivities(issueId);
                if (alive) setLoaded({ key, state: { status: "ready", items } });
            } catch (err) {
                if (alive) {
                    setLoaded({
                        key,
                        state: {
                            status: "error",
                            message: describeApiError(err, ISSUE_ERROR_MESSAGES, "활동 기록을 불러오지 못했어요."),
                        },
                    });
                }
            }
        })();
        return () => {
            alive = false;
        };
    }, [issueId, key]);

    // 이전 이슈(또는 이전 버전)의 결과는 보여 주지 않는다.
    const state: State = loaded && loaded.key === key ? loaded.state : { status: "loading" };

    if (state.status === "loading") return <p className="act-note">불러오는 중...</p>;
    if (state.status === "error") return <p className="act-note">{state.message}</p>;
    if (state.items.length === 0) return <p className="act-note">아직 기록이 없습니다.</p>;

    return (
        <ul className="act-list">
            {state.items.map((a) => {
                const line = describeActivity(a);
                return (
                    <li key={a.id} className="act">
                        <Avatar name={a.actorName} size={24} emptyTitle="지워진 사용자" />
                        <div className="act__body">
                            <p className="act__text">
                                <b>{a.actorName ?? "지워진 사용자"}</b>
                                {line.text}
                                <span className="act__time" title={a.fstRegDttm}>
                                    {formatRelative(a.fstRegDttm)}
                                </span>
                            </p>
                            {line.change && (
                                <p className="act__change">
                                    <span className="act__from">{line.change.from}</span>
                                    <span className="act__arrow">→</span>
                                    <span className="act__to">{line.change.to}</span>
                                </p>
                            )}
                            {line.quote && <p className="act__quote">{line.quote}</p>}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

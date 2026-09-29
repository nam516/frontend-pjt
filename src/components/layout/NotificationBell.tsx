// src/components/layout/NotificationBell.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    fetchNotifications,
    fetchUnreadCount,
    markAllNotificationsRead,
    markNotificationRead,
} from "@/api/notification";
import { describeActivity } from "@/utils/activityText";
import { formatRelative } from "@/utils/format";
import type { AppNotification } from "@/types/notification";
import "@/styles/notification.css";

/** 안 읽은 개수를 다시 묻는 주기. 실시간(SSE)은 다음 단계에서 붙인다. */
const POLL_MS = 30_000;

type ListState =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "ready"; items: AppNotification[] }
    | { status: "error" };

/**
 * 상단 바의 종 아이콘 (로드맵 B20 1단계).
 *
 * <p>빨간 숫자 = 안 읽은 알림 수. 30초마다, 그리고 창으로 돌아올 때마다 다시 묻는다.
 * 누르면 최신 알림 목록이 펼쳐지고, 항목을 누르면 읽음으로 바꾼 뒤 그 이슈를 보드에서 연다.
 *
 * <p>무엇이 알림이 되는지는 서버가 정한다: 내가 담당자·보고자인 이슈의 변경·댓글, 내가 담당자로 지정됨.
 * 내가 한 일은 오지 않는다.
 */
export default function NotificationBell() {
    const navigate = useNavigate();
    const [unread, setUnread] = useState(0);
    const [open, setOpen] = useState(false);
    const [list, setList] = useState<ListState>({ status: "idle" });
    const rootRef = useRef<HTMLDivElement | null>(null);

    const refreshCount = useCallback(async () => {
        try {
            setUnread(await fetchUnreadCount());
        } catch {
            /* 숫자 하나 못 읽었다고 화면을 흔들지 않는다. 다음 주기에 다시 묻는다. */
        }
    }, []);

    // 주기적으로 + 창으로 돌아올 때 개수 갱신
    useEffect(() => {
        void (async () => {
            await refreshCount();
        })();
        const timer = window.setInterval(() => void refreshCount(), POLL_MS);
        const onVisible = () => {
            if (document.visibilityState === "visible") void refreshCount();
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => {
            window.clearInterval(timer);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [refreshCount]);

    // 바깥을 누르거나 Esc 로 닫기
    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const loadList = async () => {
        setList({ status: "loading" });
        try {
            const items = await fetchNotifications();
            setList({ status: "ready", items });
            void refreshCount(); // 목록을 연 김에 숫자도 맞춘다
        } catch {
            setList({ status: "error" });
        }
    };

    const toggle = () => {
        const next = !open;
        setOpen(next);
        if (next) void loadList();
    };

    const handleItem = async (n: AppNotification) => {
        setOpen(false);
        if (!n.read) {
            // 먼저 화면을 바꾸고(숫자 줄이기) 요청은 뒤에서. 실패해도 다음 주기에 맞춰진다.
            setUnread((c) => Math.max(0, c - 1));
            setList((s) =>
                s.status === "ready"
                    ? { ...s, items: s.items.map((x) => (x.id === n.id ? { ...x, read: true } : x)) }
                    : s
            );
            void markNotificationRead(n.id).catch(() => void refreshCount());
        }
        // 지워진 이슈는 열 수 없으니 보드까지만 간다.
        if (n.targetType === "ISSUE") {
            navigate(
                n.action === "DELETED"
                    ? `/projects/${n.projectId}/board`
                    : `/projects/${n.projectId}/board?issue=${n.targetId}`
            );
        }
    };

    const handleReadAll = async () => {
        setUnread(0);
        setList((s) =>
            s.status === "ready" ? { ...s, items: s.items.map((x) => ({ ...x, read: true })) } : s
        );
        try {
            await markAllNotificationsRead();
        } catch {
            void refreshCount();
        }
    };

    return (
        <div className="bell" ref={rootRef}>
            <button
                type="button"
                className={`bell__btn${open ? " bell__btn--open" : ""}`}
                aria-label={unread > 0 ? `알림 ${unread}개 안 읽음` : "알림"}
                aria-expanded={open}
                onClick={toggle}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {unread > 0 && <span className="bell__badge">{unread > 99 ? "99+" : unread}</span>}
            </button>

            {open && (
                <div className="bell__panel" role="dialog" aria-label="알림">
                    <div className="bell__head">
                        <span className="bell__title">알림</span>
                        <span className="bell__spacer" />
                        <button
                            type="button"
                            className="bell__readall"
                            disabled={unread === 0}
                            onClick={() => void handleReadAll()}
                        >
                            모두 읽음
                        </button>
                    </div>

                    <div className="bell__body">
                        {list.status === "loading" && <p className="bell__note">불러오는 중...</p>}
                        {list.status === "error" && <p className="bell__note">알림을 불러오지 못했어요.</p>}
                        {list.status === "ready" && list.items.length === 0 && (
                            <p className="bell__note">
                                새 알림이 없습니다.
                                <br />
                                내가 담당하거나 보고한 이슈가 바뀌면 여기에 옵니다.
                            </p>
                        )}
                        {list.status === "ready" &&
                            list.items.map((n) => {
                                const line = describeActivity(n);
                                return (
                                    <button
                                        key={n.id}
                                        type="button"
                                        className={`bell__item${n.read ? "" : " bell__item--unread"}`}
                                        onClick={() => void handleItem(n)}
                                    >
                                        <span className="bell__dot" aria-hidden="true" />
                                        <span className="bell__text">
                                            <span className="bell__line">
                                                <b>{n.actorName ?? "지워진 사용자"}</b>님이{" "}
                                                {n.targetLabel && <span className="bell__key">{n.targetLabel}</span>}{" "}
                                                {line.text.replace(/^님이\s*/, "")}
                                            </span>
                                            {line.change && (
                                                <span className="bell__change">
                                                    {line.change.from} → <b>{line.change.to}</b>
                                                </span>
                                            )}
                                            {line.quote && <span className="bell__quote">{line.quote}</span>}
                                            <span className="bell__time">{formatRelative(n.fstRegDttm)}</span>
                                        </span>
                                    </button>
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
}

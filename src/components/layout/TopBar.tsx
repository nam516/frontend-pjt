// src/components/layout/TopBar.tsx
import { Link } from "react-router-dom";
import { logout } from "@/api/auth";
import { tokenStore } from "@/store/auth";
import NotificationBell from "./NotificationBell";

type Props = {
    /** 좁은 화면에서 사이드 메뉴를 여닫는다 */
    onToggleSidebar: () => void;
};

/** 로그인 이후 모든 화면 위에 붙는 상단 바. (옛 AppHeader 의 로그아웃 동작을 그대로 옮겼다) */
export default function TopBar({ onToggleSidebar }: Props) {
    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            tokenStore.clear();
            window.location.replace("/login");
        }
    };

    return (
        <header className="topbar">
            <button
                type="button"
                className="topbar__menu"
                aria-label="메뉴 열기"
                onClick={onToggleSidebar}
            >
                ☰
            </button>

            <Link to="/projects" className="topbar__brand">
                Tracker
            </Link>

            <span className="topbar__spacer" />

            <NotificationBell />

            <button className="btn btn--outline btn--auto btn--sm" onClick={handleLogout}>
                로그아웃
            </button>
        </header>
    );
}

import { logout } from "@/api/auth";
import { tokenStore } from "@/store/auth";

type Props = {
    userId?: string;
};

/** 로그인 이후 화면 공통 헤더 */
export default function AppHeader({ userId }: Props) {
    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            tokenStore.clear();
            window.location.replace("/login");
        }
    };

    return (
        <header className="app-header">
            <span className="app-brand">Tracker</span>
            <span className="app-header__spacer" />
            {userId && <span className="app-user">사용자 #{userId}</span>}
            <button className="btn btn--outline btn--auto btn--sm" onClick={handleLogout}>
                로그아웃
            </button>
        </header>
    );
}

import { useNavigate } from "react-router-dom";
import { authStore } from "../auth/authStore";

export default function HomePage() {
    const nav = useNavigate();

    const logout = () => {
        authStore.logout();
        nav("/login", { replace: true });
    };

    return (
        <div style={{ padding: 24 }}>
            <h1>Home</h1>
            <p>로그인 성공 상태에서만 보이는 페이지</p>
            <button onClick={logout}>로그아웃</button>
        </div>
    );
}

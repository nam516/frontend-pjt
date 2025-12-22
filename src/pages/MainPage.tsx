import { useEffect, useState } from "react";
import { me, logout  } from "../api/auth";
import { tokenStore } from "../store/auth";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
    const nav = useNavigate();
    const [userId, setName] = useState<string>("");

    useEffect(() => {
        const run = async () => {
            const data = await me();
            if (data.authenticated) {
                setName(data.userId);
            } else {
                tokenStore.clear();
                nav("/login", { replace: true });
            }
        };
        run();
    }, [nav]);

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            tokenStore.clear();
            nav("/login", { replace: true });
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <h2>메인 페이지</h2>
            <p>환영합니다. {userId} 님</p>

            <button
                onClick={handleLogout}
                style={{
                    marginTop: 16,
                    padding: "8px 16px",
                    cursor: "pointer",
                }}
            >
                로그아웃
            </button>
        </div>
    );
}

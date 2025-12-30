import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { login } from "../api/authApi";
import { token } from "../auth/token";

type Provider = "google" | "kakao" | "naver" | "apple";

export default function LoginPage() {
    const nav = useNavigate();
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const API_BASE = useMemo(
        () => (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, ""),
        []
    );

    const onLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            setLoading(true);
            const res = await login({ loginId, password });
            token.set(res.accessToken, res.refreshToken);
            nav("/", { replace: true });
        } catch {
            setError("아이디 또는 비밀번호가 올바르지 않습니다.");
        } finally {
            setLoading(false);
        }
    };

    const onSnsLogin = (provider: Provider) => {
        // Spring Security OAuth2 기본 진입점
        window.location.href = `${API_BASE}/oauth2/authorization/${provider}`;
    };

    return (
        <div className="login-page">
            <form className="login-card" onSubmit={onLogin}>
                <h1>로그인</h1>

                <input
                    placeholder="아이디"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                />

                <input
                    placeholder="비밀번호"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button disabled={loading}>
                    {loading ? "로그인 중..." : "일반 로그인"}
                </button>

                {error && <p className="error">{error}</p>}

                <div className="divider">또는</div>

                <button type="button" onClick={() => onSnsLogin("google")}>
                    Google로 로그인
                </button>
                <button type="button" onClick={() => onSnsLogin("kakao")}>
                    Kakao로 로그인
                </button>
                <button type="button" onClick={() => onSnsLogin("naver")}>
                    Naver로 로그인
                </button>
                <button type="button" onClick={() => onSnsLogin("apple")}>
                    Apple로 로그인
                </button>
            </form>
        </div>
    );
}

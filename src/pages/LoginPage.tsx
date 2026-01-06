import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
        window.location.href = `${API_BASE}/oauth2/authorization/${provider}`;
    };

    return (
        <div className="page">
            <div className="container-sm">
                <form className="card card--topbar" onSubmit={onLogin}>
                    <h1 className="title">로그인</h1>

                    <div className="stack">
                        <input
                            className="input"
                            placeholder="아이디"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            autoComplete="username"
                        />

                        <input
                            className="input"
                            placeholder="비밀번호"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />

                        <button className="btn btn--primary" disabled={loading}>
                            {loading ? "로그인 중..." : "일반 로그인"}
                        </button>

                        {error && <div className="alert-error">{error}</div>}
                    </div>

                    <div className="divider">또는</div>

                    <div className="stack">
                        <button type="button" className="btn btn--google" disabled onClick={() => onSnsLogin("google")}>
                            Google로 로그인
                        </button>
                        <button type="button" className="btn btn--kakao" onClick={() => onSnsLogin("kakao")}>
                            Kakao로 로그인
                        </button>
                        <button type="button" className="btn btn--naver"  onClick={() => onSnsLogin("naver")}>
                            Naver로 로그인
                        </button>
                        <button type="button" className="btn btn--apple" disabled onClick={() => onSnsLogin("apple")}>
                            Apple로 로그인
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

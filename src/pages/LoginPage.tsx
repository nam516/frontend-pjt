import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, me } from "../api/auth";
import { tokenStore } from "../store/auth";

export default function LoginPage() {
    const nav = useNavigate();
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg(null);
        setLoading(true);

        try {
            // 1) 로그인 요청 -> 토큰 받기
            const tokens = await login({ loginId, password });

            // 2) 토큰 저장
            tokenStore.setAccessToken(tokens.accessToken);
            tokenStore.setRefreshToken(tokens.refreshToken);

            // 3) 저장된 access token으로 /me 확인
            const data = await me();
            if (data.authenticated) {
                nav("/", { replace: true });
            } else {
                tokenStore.clear();
                setMsg("인증 확인 실패");
            }
        } catch (err: any) {
            tokenStore.clear();
            setMsg("로그인 실패 (아이디/비밀번호 확인)");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24, maxWidth: 360 }}>
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 12 }}>
                    <input
                        placeholder="loginId"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        style={{ width: "100%", padding: 10 }}
                    />
                </div>

                <div style={{ marginBottom: 12 }}>
                    <input
                        placeholder="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: "100%", padding: 10 }}
                    />
                </div>

                <button disabled={loading} style={{ width: "100%", padding: 10 }}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
        </div>
    );
}

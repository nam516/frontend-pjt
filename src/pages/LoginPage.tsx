import { useState } from "react";
import { authProviders } from "@/constants/authProviders";
import SnsButton from "@/components/auth/SnsButton";
import "@/styles/components.css";
import "@/styles/auth.css";

import { login as loginApi } from "@/api/auth"; // 경로 맞춰줘
import { tokenStore } from "@/store/auth";     // 경로 맞춰줘

export default function LoginPage() {
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!loginId || !password) return;

        try {
            setLoading(true);

            const { accessToken, refreshToken } = await loginApi({
                loginId,
                password,
            })

            tokenStore.setAccessToken(accessToken);
            tokenStore.setRefreshToken(refreshToken);

            window.location.assign("/main");
        } catch (err: any) {
            // axios 에러 메시지 처리(대충 안전하게)
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "로그인에 실패했어요. 아이디/비밀번호를 확인해주세요.";
            setErrorMsg(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="card card--auth">
                <header className="auth-header">
                    <h1 className="auth-title">로그인</h1>
                    <p className="auth-desc">간편 로그인 또는 일반 로그인을 이용하세요.</p>
                </header>

                {/* 일반 로그인 */}
                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="form-field">
                        <input
                            type="text"
                            placeholder="아이디"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-field">
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    {errorMsg && <p className="form-error">{errorMsg}</p>}

                    <button
                        type="submit"
                        className="btn btn--primary"
                        disabled={loading || !loginId || !password}
                    >
                        {loading ? "로그인 중..." : "일반 로그인"}
                    </button>
                </form>

                {/* 회원가입 */}
                <div className="auth-footer">
                    <span>아직 계정이 없으신가요?</span>
                    <button
                        type="button"
                        className="btn btn--outline"
                        onClick={() => window.location.assign("/signup")}
                        disabled={loading}
                    >
                        회원가입
                    </button>
                </div>

                <div className="auth-divider">
                    <span>또는</span>
                </div>

                {/* SNS 로그인 */}
                <div className="auth-sns">
                    {authProviders.map((p) => (
                        <SnsButton
                            key={p.type}
                            image={p.buttonImage}
                            label={p.label}
                            disabled={loading || p.disabled}
                            onClick={() => window.location.assign(p.authorizationUrl)}
                        />
                    ))}
                </div>
            </section>
        </main>
    );
}

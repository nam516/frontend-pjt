// src/pages/LoginPage.tsx
import { useState } from "react";
import { authProviders } from "@/constants/authProviders";
import SnsButton from "@/components/auth/SnsButton";
import "@/styles/components.css";
import "@/styles/auth.css";
import { login as loginApi, extractApiErrorMsg } from "@/api/auth";

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
            // loginApi 내부에서 tokenStore에 저장까지 해줌
            await loginApi({ loginId, password });
            window.location.replace("/projects");
        } catch (err) {
            // extractApiErrorMsg: 항상 string 반환 → React error #31 방지
            setErrorMsg(extractApiErrorMsg(err, "아이디 또는 비밀번호를 확인해주세요."));
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
                            placeholder="비밀번호 입력"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    {/* errorMsg는 항상 string | null → 객체 절대 안 들어옴 */}
                    {errorMsg && <p className="form-error">{errorMsg}</p>}

                    <button
                        type="submit"
                        className="btn btn--primary"
                        disabled={loading || !loginId || !password}
                    >
                        {loading ? "로그인 중..." : "일반 로그인"}
                    </button>
                </form>

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

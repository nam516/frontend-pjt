import { authProviders } from "@/constants/authProviders";
import SnsButton from "@/components/auth/SnsButton";
import "@/styles/components.css";

export default function LoginPage() {
    return (
        <main className="auth-page">
            <section className="card card--auth">
                <header className="auth-header">
                    <h1 className="auth-title">로그인</h1>
                    <p className="auth-desc">간편 로그인으로 빠르게 시작하세요.</p>
                </header>

                <div className="auth-sns">
                    {authProviders.map((p) => (
                        <SnsButton
                            key={p.type}
                            image={p.buttonImage}
                            label={p.label}
                            disabled={p.disabled}
                            onClick={() => window.location.assign(p.authorizationUrl)}
                        />
                    ))}
                </div>

                <div className="auth-divider">
                    <span>또는</span>
                </div>

                <button className="btn btn--primary" disabled>
                    일반 로그인(추가 예정)
                </button>
            </section>
        </main>
    );
}

import { useState } from "react";
import { login } from "../api/auth";
import { getMe } from "../api/user";

export default function LoginPage() {
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const data = await login({
                loginId,
                password,
            });

            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);

            console.log("로그인 성공");
            console.log("accessToken =", data.accessToken);
            console.log("refreshToken =", data.refreshToken);

            alert("로그인 성공!");
        } catch (error) {
            console.error(error);
            alert("로그인 실패 (아이디/비밀번호 확인)");
        }
    };

    return (
        <div style={{ maxWidth: 360, margin: "80px auto", padding: 16 }}>
            <h1 style={{ fontSize: 24, marginBottom: 16 }}>로그인</h1>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
                <label style={{ display: "grid", gap: 6 }}>
                    <span>아이디</span>
                    <input
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        placeholder="loginId"
                        autoComplete="username"
                        style={{ padding: 10, fontSize: 14 }}
                    />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                    <span>비밀번호</span>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="password"
                        autoComplete="current-password"
                        style={{ padding: 10, fontSize: 14 }}
                    />
                </label>

                <button type="submit" style={{ padding: 10, fontSize: 14 }}>
                    로그인
                </button>
            </form>
            <button
                type="button"
                onClick={async () => {
                    try {
                        const me = await getMe();
                        console.log("me =", me);
                        alert("me 호출 성공! 콘솔 확인");
                    } catch (e) {
                        console.error(e);
                        alert("me 호출 실패 (401이면 토큰/백엔드 확인)");
                    }
                }}
                style={{ padding: 10, fontSize: 14 }}
            >
                /api/me 테스트
            </button>
        </div>
    );
}

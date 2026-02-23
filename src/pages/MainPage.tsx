// src/pages/MainPage.tsx
import { useEffect, useState } from "react";
import { me, logout, extractApiErrorMsg } from "@/api/auth";
import { tokenStore } from "@/store/auth";
import "@/styles/components.css";

type ViewState =
    | { status: "loading" }
    | { status: "guest" }
    | { status: "authed"; userId: string }
    | { status: "error"; message: string };

export default function MainPage() {
    const [state, setState] = useState<ViewState>({ status: "loading" });
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await me();

                if (!res.authenticated) {
                    setState({ status: "guest" });
                    window.location.assign("/login");
                    return;
                }

                setState({ status: "authed", userId: String(res.userId) });
            } catch (err) {
                // extractApiErrorMsg: 항상 string 반환 → React error #31 방지
                const message = extractApiErrorMsg(err, "인증 정보를 불러오지 못했어요.");
                setState({ status: "error", message });
            }
        })();
    }, []);

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            await logout();
            tokenStore.clear();
            window.location.assign("/login");
        } catch (err) {
            alert(extractApiErrorMsg(err, "로그아웃에 실패했어요. 다시 시도해주세요."));
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
            <section className="card" style={{ width: 420 }}>
                {state.status === "loading" && (
                    <>
                        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                            불러오는 중...
                        </h1>
                        <p style={{ fontSize: 14, color: "#666" }}>
                            로그인 정보를 확인하고 있어요.
                        </p>
                    </>
                )}

                {state.status === "guest" && (
                    <>
                        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                            로그인 필요
                        </h1>
                        <p style={{ fontSize: 14, color: "#666", marginBottom: 14 }}>
                            로그인 후 이용할 수 있어요.
                        </p>
                        <button
                            className="btn btn--primary"
                            onClick={() => window.location.assign("/login")}
                            style={{ width: "100%" }}
                        >
                            로그인 페이지로
                        </button>
                    </>
                )}

                {state.status === "authed" && (
                    <>
                        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                            로그인 완료 🎉
                        </h1>
                        <p style={{ fontSize: 14, color: "#666", marginBottom: 18 }}>
                            현재 로그인 사용자: <b>{state.userId}</b>
                        </p>
                        <button
                            className="btn btn--primary"
                            onClick={handleLogout}
                            disabled={loggingOut}
                            style={{ width: "100%" }}
                        >
                            {loggingOut ? "로그아웃 중..." : "로그아웃"}
                        </button>
                    </>
                )}

                {state.status === "error" && (
                    <>
                        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                            오류
                        </h1>
                        {/* state.message는 항상 string → 안전 */}
                        <p style={{ fontSize: 14, color: "#d12c2c", marginBottom: 14 }}>
                            {state.message}
                        </p>
                        <button
                            className="btn btn--primary"
                            onClick={() => window.location.assign("/login")}
                            style={{ width: "100%" }}
                        >
                            로그인 다시하기
                        </button>
                    </>
                )}
            </section>
        </main>
    );
}

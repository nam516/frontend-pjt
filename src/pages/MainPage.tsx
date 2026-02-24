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
        // 뒤로가기로 접근했을 때 브라우저 캐시 무력화
        // bfcache(Back-Forward Cache)에서 복원된 경우 강제로 토큰 재검증
        const handlePageShow = (e: PageTransitionEvent) => {
            if (e.persisted) {
                // bfcache에서 복원된 경우 → 토큰 없으면 바로 로그인으로
                if (!tokenStore.getAccessToken()) {
                    window.location.replace("/login");
                }
            }
        };

        window.addEventListener("pageshow", handlePageShow);
        return () => window.removeEventListener("pageshow", handlePageShow);
    }, []);

    useEffect(() => {
        (async () => {
            // accessToken 없으면 바로 리다이렉트
            if (!tokenStore.getAccessToken()) {
                window.location.replace("/login");
                return;
            }

            try {
                // 매번 서버에 실제 인증 상태 확인 (캐시된 화면 방지)
                const res = await me();
                if (!res.authenticated) {
                    setState({ status: "guest" });
                    return;
                }
                setState({ status: "authed", userId: String(res.userId) });
            } catch (err) {
                const message = extractApiErrorMsg(err, "인증 정보를 불러오지 못했어요.");
                // 401이면 토큰 만료 → 로그인으로
                tokenStore.clear();
                setState({ status: "error", message });
            }
        })();
    }, []);

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            await logout();
            tokenStore.clear();
            // replace로 이동해서 뒤로가기 히스토리에서 main 제거
            window.location.replace("/login");
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

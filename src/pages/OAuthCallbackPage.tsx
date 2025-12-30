import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { token } from "../auth/token";

export default function OAuthCallbackPage() {
    const nav = useNavigate();
    const [params] = useSearchParams();

    useEffect(() => {
        const accessToken = params.get("accessToken");
        const refreshToken = params.get("refreshToken") ?? undefined;

        if (accessToken) {
            token.set(accessToken, refreshToken);
            nav("/", { replace: true });
        } else {
            nav("/login", { replace: true });
        }
    }, [nav, params]);

    return <div>로그인 처리 중...</div>;
}

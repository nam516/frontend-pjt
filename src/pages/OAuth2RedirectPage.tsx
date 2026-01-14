// src/pages/OAuth2RedirectPage.tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { token } from "@/auth/token";

export default function OAuth2RedirectPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    useEffect(() => {
        const accessToken = params.get("accessToken");
        const refreshToken = params.get("refreshToken"); // 있으면

        if (!accessToken) {
            // 토큰 없이 들어오면 로그인으로
            navigate("/login", { replace: true });
            return;
        }

        token.set(accessToken, refreshToken ?? undefined);

        navigate("/", { replace: true });
    }, [navigate, params]);

    return null;
}

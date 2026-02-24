// src/pages/OAuth2RedirectPage.tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { tokenStore } from "@/store/auth";

export default function OAuth2RedirectPage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    useEffect(() => {
        const accessToken = params.get("accessToken");

        if (!accessToken) {
            navigate("/login", { replace: true });
            return;
        }

        // accessToken만 저장 (refreshToken은 백엔드가 HttpOnly 쿠키로 자동 설정)
        tokenStore.setAccessToken(accessToken);

        navigate("/main", { replace: true });
    }, [navigate, params]);

    return null;
}

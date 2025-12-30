import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tokenStore } from "./tokenStore";

export default function OAuth2RedirectHandler() {
    const nav = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("accessToken");
        const error = params.get("error");

        if (accessToken) {
            tokenStore.setAccessToken(accessToken);
            nav("/", { replace: true });
            return;
        }

        if (error) {
            nav(`/login?error=${encodeURIComponent(error)}`, { replace: true });
            return;
        }

        nav("/login", { replace: true });
    }, [nav]);

    return null;
}

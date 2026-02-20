import { Navigate, useLocation } from "react-router-dom";
import { tokenStore } from "@/store/auth";
import type { ReactElement } from "react";  // ← 추가

type Props = {
    children: ReactElement;  // JSX.Element → ReactElement
};

export default function RequireAuth({ children }: Props) {
    const location = useLocation();
    const accessToken = tokenStore.getAccessToken();

    if (!accessToken) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
}
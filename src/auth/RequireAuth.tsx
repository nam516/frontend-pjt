// src/auth/RequireAuth.tsx
import { Navigate } from "react-router-dom";
import { token } from "./token";

type Props = {
    children: JSX.Element;
};

export default function RequireAuth({ children }: Props) {
    const isAuthenticated = !!token.getAccess();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

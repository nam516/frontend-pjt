import { Navigate, useLocation } from "react-router-dom";
import { tokenStore } from "@/store/auth";

type Props = {
    children: JSX.Element;
};

export default function RequireAuth({ children }: Props) {
    const location = useLocation();
    const accessToken = tokenStore.getAccessToken();

    if (!accessToken) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
}

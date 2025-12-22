import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { me } from "../api/auth";
import { tokenStore } from "../store/auth";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
    const [loading, setLoading] = useState(true);
    const [ok, setOk] = useState(false);

    useEffect(() => {
        const run = async () => {
            const token = tokenStore.getAccessToken();
            if (!token) {
                setOk(false);
                setLoading(false);
                return;
            }

            try {
                const data = await me();
                setOk(data.authenticated === true);
            } catch {
                setOk(false);
            } finally {
                setLoading(false);
            }
        };

        run();
    }, []);

    if (loading) return <div>Checking auth...</div>;
    if (!ok) return <Navigate to="/login" replace />;

    return children;
}

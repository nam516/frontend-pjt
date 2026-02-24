// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import MainPage from "@/pages/MainPage";
import SignupPage from "@/pages/SignupPage";
import OAuth2RedirectPage from "@/pages/OAuth2RedirectPage";
import RequireAuth from "@/auth/RequireAuth";
import { tokenStore } from "@/store/auth";

function HomeRedirect() {
    const isAuthed = !!tokenStore.getAccessToken();
    return <Navigate to={isAuthed ? "/main" : "/login"} replace />;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                <Route
                    path="/main"
                    element={
                        <RequireAuth>
                            <MainPage />
                        </RequireAuth>
                    }
                />
                <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />
            </Routes>
        </BrowserRouter>
    );
}

// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import MainPage from "@/pages/MainPage";
import SignupPage from "@/pages/SignupPage";
import OAuth2RedirectPage from "@/pages/OAuth2RedirectPage";
import ProjectListPage from "@/pages/ProjectListPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import BoardPage from "@/pages/BoardPage";
import RequireAuth from "@/auth/RequireAuth";
import { tokenStore } from "@/store/auth";

function HomeRedirect() {
    const isAuthed = !!tokenStore.getAccessToken();
    return <Navigate to={isAuthed ? "/projects" : "/login"} replace />;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />

                <Route
                    path="/projects"
                    element={
                        <RequireAuth>
                            <ProjectListPage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/projects/:projectId"
                    element={
                        <RequireAuth>
                            <ProjectDetailPage />
                        </RequireAuth>
                    }
                />

                <Route
                    path="/projects/:projectId/board"
                    element={
                        <RequireAuth>
                            <BoardPage />
                        </RequireAuth>
                    }
                />

                <Route
                    path="/main"
                    element={
                        <RequireAuth>
                            <MainPage />
                        </RequireAuth>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

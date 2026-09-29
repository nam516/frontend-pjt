// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import MainPage from "@/pages/MainPage";
import SignupPage from "@/pages/SignupPage";
import OAuth2RedirectPage from "@/pages/OAuth2RedirectPage";
import ProjectListPage from "@/pages/ProjectListPage";
import ProjectMembersPage from "@/pages/ProjectMembersPage";
import ProjectSettingsPage from "@/pages/ProjectSettingsPage";
import BoardPage from "@/pages/BoardPage";
import RequireAuth from "@/auth/RequireAuth";
import AppLayout from "@/components/layout/AppLayout";
import ProjectLayout from "@/components/layout/ProjectLayout";
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

                {/* 로그인 이후 화면 — 상단 바 + 사이드 메뉴 틀(AppLayout) 안에 그린다 */}
                <Route
                    element={
                        <RequireAuth>
                            <AppLayout />
                        </RequireAuth>
                    }
                >
                    <Route path="/projects" element={<ProjectListPage />} />

                    {/* 프로젝트 안 — 머리글 + 탭(ProjectLayout). 들어오면 바로 보드. */}
                    <Route path="/projects/:projectId" element={<ProjectLayout />}>
                        <Route index element={<Navigate to="board" replace />} />
                        <Route path="board" element={<BoardPage />} />
                        <Route path="members" element={<ProjectMembersPage />} />
                        <Route path="settings" element={<ProjectSettingsPage />} />
                    </Route>
                </Route>

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

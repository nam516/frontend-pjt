import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

export default defineConfig({
    plugins: [react(), svgr()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    // vite.config.ts
    server: {
        proxy: {
            // OAuth2 로그인 시작
            "/oauth2/authorization": {
                target: "http://localhost:8080",
                changeOrigin: true,
                secure: false,
            },
            // OAuth2 콜백
            "/login/oauth2/code": {
                target: "http://localhost:8080",
                changeOrigin: true,
                secure: false,
            },
            "/api": {
                target: "http://localhost:8080",
                changeOrigin: true,
                secure: false,
            },
        },
    },
});

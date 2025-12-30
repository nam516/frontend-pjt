import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// ✅ 공통 CSS 한 번만 로드
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/auth.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

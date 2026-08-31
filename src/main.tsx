import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// 디자인 토큰(--c-*, --sp-*, --radius-*)이 먼저 정의돼야
// 뒤따르는 css 의 var() 가 값을 찾는다. 순서를 바꾸면 안 된다.
import "./styles/token.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/auth.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

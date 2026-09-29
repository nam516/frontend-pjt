// src/components/layout/SidebarIcons.tsx
// 사이드 메뉴 전용 작은 선 아이콘. 외부 아이콘 라이브러리를 들이지 않으려고 직접 그렸다.
// 색은 currentColor 를 따르므로 CSS 의 color 로 바뀐다.
import type { ReactNode } from "react";

type IconProps = { size?: number };

function Svg({ size = 16, children }: IconProps & { children: ReactNode }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

export function GridIcon(props: IconProps) {
    return (
        <Svg {...props}>
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </Svg>
    );
}

export function PlusIcon(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M12 5v14M5 12h14" />
        </Svg>
    );
}

export function TicketIcon(props: IconProps) {
    return (
        <Svg {...props}>
            <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4Z" />
            <path d="M13 6v2M13 11v2M13 16v2" />
        </Svg>
    );
}

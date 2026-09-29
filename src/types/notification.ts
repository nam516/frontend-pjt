// src/types/notification.ts
import type { Activity } from "./issue";

/**
 * 알림 한 줄 — 백엔드 NotificationResDTO.Item (로드맵 B20).
 * 문장에 필요한 값은 활동 기록과 같은 모양이라 Activity 를 그대로 넓혀 쓴다
 * (문장 함수 `describeActivity` 를 활동 탭과 함께 쓰기 위해).
 */
export type AppNotification = Activity & {
    read: boolean;
    projectId: number;
    targetType: "ISSUE" | "PAGE";
    targetId: number;
};

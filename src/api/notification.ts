// src/api/notification.ts
import api from "./axios";
import { unwrap, type ApiResponse } from "./common";
import type { AppNotification } from "@/types/notification";

/* 내 알림 (로드맵 B20 1단계). 전부 로그인한 본인 것만. */

export async function fetchNotifications(limit = 30): Promise<AppNotification[]> {
    return unwrap(await api.get<ApiResponse<AppNotification[]>>("/api/notifications", { params: { limit } }));
}

export async function fetchUnreadCount(): Promise<number> {
    const res = unwrap(await api.get<ApiResponse<{ count: number }>>("/api/notifications/unread-count"));
    return res.count;
}

export async function markNotificationRead(id: number): Promise<void> {
    await api.patch(`/api/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
    await api.patch("/api/notifications/read-all");
}

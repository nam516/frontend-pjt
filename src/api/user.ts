import { api } from "./client";

export type MeResponse = {
    id: number;
    loginId: string;
};

export async function getMe() {
    const res = await api.get<MeResponse>("/api/me");
    return res.data;
}

import { api } from "./axios";
import {tokenStore} from "../store/auth.ts";

export type LoginRequest = {
    loginId: string;
    password: string;
};

export type TokenResponse = {
    accessToken: string;
    refreshToken: string;
};

export type MeResponse =
    | { authenticated: false }
    | { authenticated: true; userId: string };

export async function login(req: LoginRequest) {
    const res = await api.post<TokenResponse>("/auth/login", req);
    return res.data;
}

export async function me() {
    const res = await api.get<MeResponse>("/auth/api/me");
    return res.data;
}

export async function logout() {
    const refreshToken = tokenStore.getRefreshToken();
    await api.post("/auth/logout", {
        refreshToken,
    });
}
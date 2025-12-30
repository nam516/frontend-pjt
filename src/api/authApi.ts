import { http } from "./http";

export type LoginRequest = {
    loginId: string;
    password: string;
};

export type LoginResponse = {
    accessToken: string;
    refreshToken: string;
};

export async function login(req: LoginRequest): Promise<LoginResponse> {
    const { data } = await http.post("/auth/login", req);
    return data;
}

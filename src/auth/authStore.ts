import { token } from "./token";

export const authStore = {
    isAuthed(): boolean {
        return !!token.getAccess();
    },
    logout() {
        token.clear();
    },
};

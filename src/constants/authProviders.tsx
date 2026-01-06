import kakaoBtn from "@/assets/images/kakao_login_btn.png";
import naverBtn from "@/assets/images/naver_login_btn.png";

export type AuthProviderType = "kakao" | "naver";

export interface AuthProvider {
    type: AuthProviderType;
    label: string;
    buttonImage: string;
    authorizationUrl: string;
    disabled?: boolean;
}

export const authProviders: AuthProvider[] = [
    {
        type: "kakao",
        label: "카카오로 로그인",
        buttonImage: kakaoBtn,
        authorizationUrl: "/oauth2/authorization/kakao",
    },
    {
        type: "naver",
        label: "네이버로 로그인",
        buttonImage: naverBtn,
        authorizationUrl: "/oauth2/authorization/naver",
    },
];

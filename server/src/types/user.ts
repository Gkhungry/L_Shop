export type UserId = string;

export interface UserAuthData {
    id: UserId;
    name: string;
    email: string;
    login: string;
    phone: string;
    passwordHash: string;
    createdAt: string;
}

export interface UserPublicData {
    id: UserId;
    name: string;
    email: string;
    login: string;
    phone: string;
}

export interface UserRegistrationPayload {
    name: string;
    email: string;
    login: string;
    phone: string;
    password: string;
}

export interface UserLoginPayload {
    loginOrEmailOrPhone: string;
    password: string;
}

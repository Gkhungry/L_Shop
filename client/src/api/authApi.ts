import type { User } from '../types/user';

const BASE_URL = 'http://localhost:3000/api/auth'; // или '/api/auth', если фронт и бэк на одном домене

interface RegisterPayload {
    name: string;
    email: string;
    login: string;
    phone: string;
    password: string;
}

interface LoginPayload {
    loginOrEmailOrPhone: string;
    password: string;
}

interface AuthResponse {
    user: User;
}

async function request<T>(url: string, options: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers ?? {}),
        },
    });

    if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
        const message = errorBody?.error ?? `Request failed with ${response.status}`;
        throw new Error(message);
    }

    return (await response.json()) as T;
}

export async function register(payload: RegisterPayload): Promise<User> {
    const data = await request<AuthResponse>(`${BASE_URL}/register`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return data.user;
}

export async function login(payload: LoginPayload): Promise<User> {
    const data = await request<AuthResponse>(`${BASE_URL}/login`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return data.user;
}

export async function currentUser(): Promise<User | null> {
    try {
        const data = await request<AuthResponse>(`${BASE_URL}/me`, {
            method: 'GET',
        });
        return data.user;
    } catch {
        return null;
    }
}

export async function logout(): Promise<void> {
    await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
    });
}

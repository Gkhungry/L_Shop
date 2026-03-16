import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import {
    UserAuthData,
    UserPublicData,
    UserRegistrationPayload,
    UserLoginPayload,
} from '../types/user';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE_PATH = path.join(__dirname, '..', '..', 'users.json');

async function readUsers(): Promise<UserAuthData[]> {
    try {
        const raw = await fs.readFile(USERS_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw) as UserAuthData[];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e: unknown) {
        if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }
        throw e;
    }
}

async function writeUsers(users: UserAuthData[]): Promise<void> {
    const json = JSON.stringify(users, null, 2);
    await fs.writeFile(USERS_FILE_PATH, json, 'utf-8');
}

function toPublic(user: UserAuthData): UserPublicData {
    const { id, name, email, login, phone } = user;
    return { id, name, email, login, phone };
}

export async function registerUser(
    payload: UserRegistrationPayload,
): Promise<UserPublicData> {
    const users = await readUsers();

    const exists = users.find(
        (u) =>
            u.email === payload.email ||
            u.login === payload.login ||
            u.phone === payload.phone,
    );

    if (exists) {
        throw new Error('User with same email/login/phone already exists');
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user: UserAuthData = {
        id: crypto.randomUUID(),
        name: payload.name,
        email: payload.email,
        login: payload.login,
        phone: payload.phone,
        passwordHash,
        createdAt: new Date().toISOString(),
    };

    users.push(user);
    await writeUsers(users);

    return toPublic(user);
}

export async function authenticateUser(
    payload: UserLoginPayload,
): Promise<UserPublicData | null> {
    const users = await readUsers();

    const user = users.find(
        (u) =>
            u.email === payload.loginOrEmailOrPhone ||
            u.login === payload.loginOrEmailOrPhone ||
            u.phone === payload.loginOrEmailOrPhone,
    );

    if (!user) {
        return null;
    }

    const valid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!valid) {
        return null;
    }

    return toPublic(user);
}

export async function getUserById(id: string): Promise<UserPublicData | null> {
    const users = await readUsers();
    const found = users.find((u) => u.id === id);
    return found ? toPublic(found) : null;
}

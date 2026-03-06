import { Response, Request } from 'express';
import jwt from 'jsonwebtoken';

const SESSION_COOKIE_NAME = 'session';
const SESSION_TTL_MS = 10 * 60 * 1000;

interface SessionPayload {
    userId: string;
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';

export function setSessionCookie(res: Response, userId: string): void {
    const payload: SessionPayload = { userId };
    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: Math.floor(SESSION_TTL_MS / 1000),
    });

    res.cookie(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_TTL_MS,
        path: '/',
    });
}

export function clearSessionCookie(res: Response): void {
    res.clearCookie(SESSION_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}

export function getUserIdFromRequest(req: Request): string | null {
    const token = req.cookies?.[SESSION_COOKIE_NAME];
    if (!token) {
        return null;
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as SessionPayload;
        return decoded.userId;
    } catch {
        return null;
    }
}

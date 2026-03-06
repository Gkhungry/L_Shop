import { Request, Response } from 'express';
import {
    registerUser,
    authenticateUser,
    getUserById,
} from '../services/user.service';
import { setSessionCookie, clearSessionCookie, getUserIdFromRequest } from '../utils/session';
import { UserRegistrationPayload, UserLoginPayload } from '../types/user';

export async function postRegister(req: Request, res: Response): Promise<void> {
    const body = req.body as Partial<UserRegistrationPayload>;

    if (
        !body.name ||
        !body.email ||
        !body.login ||
        !body.phone ||
        !body.password
    ) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    }

    try {
        const user = await registerUser(body as UserRegistrationPayload);
        setSessionCookie(res, user.id);
        res.status(201).json({ user });
    } catch (e: unknown) {
        res.status(400).json({ error: (e as Error).message });
    }
}

export async function postLogin(req: Request, res: Response): Promise<void> {
    const body = req.body as Partial<UserLoginPayload>;

    if (!body.loginOrEmailOrPhone || !body.password) {
        res.status(400).json({ error: 'Credentials are required' });
        return;
    }

    const user = await authenticateUser(body as UserLoginPayload);

    if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }

    setSessionCookie(res, user.id);
    res.status(200).json({ user });
}

export async function postLogout(_req: Request, res: Response): Promise<void> {
    clearSessionCookie(res);
    res.status(204).end();
}

export async function getCurrentUser(req: Request, res: Response): Promise<void> {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    const user = await getUserById(userId);
    if (!user) {
        clearSessionCookie(res);
        res.status(401).json({ error: 'Session invalid' });
        return;
    }
    res.status(200).json({ user });
}

import { Request, Response, NextFunction } from 'express';
import { getUserIdFromRequest } from '../utils/session';

export function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
        res.status(401).json({ error: 'Требуется авторизация' });
        return;
    }
    // можно повесить userId на req, если нужно
    (req as Request & { userId: string }).userId = userId;
    next();
}

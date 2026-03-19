import type { Request, Response } from 'express';
import { createDelivery, getDeliveriesByUserId } from '../services/delivery.service';
import type { CreateDeliveryPayload } from '../types/delivery';

type AuthenticatedRequest = Request & { userId: string };

export async function postDelivery(
    req: Request<unknown, unknown, Partial<CreateDeliveryPayload>>,
    res: Response,
): Promise<void> {
    const body = req.body;

    if (!body.items || !body.address || !body.payment) {
        res.status(400).json({ error: 'Заполните данные доставки и оплаты' });
        return;
    }

    try {
        const delivery = await createDelivery(
            (req as AuthenticatedRequest).userId,
            body as CreateDeliveryPayload,
        );
        res.status(201).json({ delivery });
    } catch (error: unknown) {
        res.status(400).json({ error: (error as Error).message });
    }
}

export async function getMyDeliveries(req: Request, res: Response): Promise<void> {
    const deliveries = await getDeliveriesByUserId(
        (req as AuthenticatedRequest).userId,
    );
    res.status(200).json({ deliveries });
}

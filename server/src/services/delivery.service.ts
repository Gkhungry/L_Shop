import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import type {
    CreateDeliveryPayload,
    Delivery,
    DeliveryAddress,
    DeliveryItem,
    DeliveryPayment,
    PaymentMethod,
} from '../types/delivery';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DELIVERIES_FILE_PATH = path.join(__dirname, '..', '..', 'deliveries.json');

async function readDeliveries(): Promise<Delivery[]> {
    try {
        const raw = await fs.readFile(DELIVERIES_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw) as Delivery[];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error: unknown) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

async function writeDeliveries(deliveries: Delivery[]): Promise<void> {
    await fs.writeFile(
        DELIVERIES_FILE_PATH,
        JSON.stringify(deliveries, null, 2),
        'utf-8',
    );
}

function validateItems(items: DeliveryItem[]): void {
    if (items.length === 0) {
        throw new Error('Добавьте хотя бы один товар в корзину');
    }

    items.forEach((item) => {
        if (!item.productId || !item.name) {
            throw new Error('Некорректные данные товара');
        }
        if (!Number.isFinite(item.price) || item.price <= 0) {
            throw new Error('У товара указана некорректная цена');
        }
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            throw new Error('Укажите корректное количество товара');
        }
    });
}

function validateAddress(address: DeliveryAddress): void {
    if (!address.fullAddress.trim()) {
        throw new Error('Укажите адрес доставки');
    }
    if (!address.recipientPhone.trim()) {
        throw new Error('Укажите телефон получателя');
    }
    if (!address.recipientEmail.trim()) {
        throw new Error('Укажите email получателя');
    }
}

function buildPayment(
    method: PaymentMethod,
    cardholderName?: string,
    cardNumber?: string,
): DeliveryPayment {
    if (method === 'card') {
        const normalizedCardholder = cardholderName?.trim() ?? '';
        const normalizedCardNumber = cardNumber?.replace(/\s+/g, '') ?? '';

        if (!normalizedCardholder) {
            throw new Error('Укажите имя владельца карты');
        }

        if (!/^\d{16}$/.test(normalizedCardNumber)) {
            throw new Error('Номер карты должен содержать 16 цифр');
        }

        return {
            method,
            cardholderName: normalizedCardholder,
            cardLast4: normalizedCardNumber.slice(-4),
            status: 'paid',
        };
    }

    return {
        method,
        status: 'paid',
    };
}

export async function createDelivery(
    userId: string,
    payload: CreateDeliveryPayload,
): Promise<Delivery> {
    validateItems(payload.items);
    validateAddress(payload.address);

    const total = payload.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    const delivery: Delivery = {
        id: crypto.randomUUID(),
        userId,
        items: payload.items,
        address: {
            fullAddress: payload.address.fullAddress.trim(),
            recipientPhone: payload.address.recipientPhone.trim(),
            recipientEmail: payload.address.recipientEmail.trim(),
            comment: payload.address.comment?.trim() || undefined,
        },
        payment: buildPayment(
            payload.payment.method,
            payload.payment.cardholderName,
            payload.payment.cardNumber,
        ),
        total,
        status: 'processing',
        createdAt: new Date().toISOString(),
    };

    const deliveries = await readDeliveries();
    deliveries.push(delivery);
    await writeDeliveries(deliveries);

    return delivery;
}

export async function getDeliveriesByUserId(userId: string): Promise<Delivery[]> {
    const deliveries = await readDeliveries();
    return deliveries
        .filter((delivery) => delivery.userId === userId)
        .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
}

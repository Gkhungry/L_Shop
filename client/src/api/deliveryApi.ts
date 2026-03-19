import type { CreateDeliveryPayload, Delivery } from '../types/delivery';

const BASE_URL = 'http://localhost:3000/api/deliveries';

interface DeliveryResponse {
    delivery: Delivery;
}

interface DeliveriesResponse {
    deliveries: Delivery[];
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
        throw new Error(errorBody?.error ?? `Ошибка запроса: ${response.status}`);
    }

    return (await response.json()) as T;
}

export async function createDelivery(
    payload: CreateDeliveryPayload,
): Promise<Delivery> {
    const data = await request<DeliveryResponse>(BASE_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    return data.delivery;
}

export async function fetchMyDeliveries(): Promise<Delivery[]> {
    const data = await request<DeliveriesResponse>(`${BASE_URL}/my`, {
        method: 'GET',
    });

    return data.deliveries;
}

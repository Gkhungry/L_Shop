export type DeliveryId = string;
export type PaymentMethod = 'card' | 'cash' | 'sbp';
export type DeliveryStatus = 'processing' | 'completed';

export interface DeliveryItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

export interface DeliveryAddress {
    fullAddress: string;
    recipientPhone: string;
    recipientEmail: string;
    comment?: string;
}

export interface DeliveryPayment {
    method: PaymentMethod;
    cardholderName?: string;
    cardLast4?: string;
    status: 'paid';
}

export interface Delivery {
    id: DeliveryId;
    userId: string;
    items: DeliveryItem[];
    address: DeliveryAddress;
    payment: DeliveryPayment;
    total: number;
    status: DeliveryStatus;
    createdAt: string;
}

export interface CreateDeliveryPayload {
    items: DeliveryItem[];
    address: DeliveryAddress;
    payment: {
        method: PaymentMethod;
        cardholderName?: string;
        cardNumber?: string;
    };
}

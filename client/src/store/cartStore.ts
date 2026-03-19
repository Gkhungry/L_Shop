import type { Product } from '../types/product';
import type { CartItem } from '../types/cart';

const STORAGE_KEY = 'l_shop_cart';

type CartListener = (items: CartItem[]) => void;

function loadCart(): CartItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as CartItem[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveCart(items: CartItem[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const listeners: Set<CartListener> = new Set();

function notify(): void {
    const items = loadCart();
    listeners.forEach((fn) => fn(items));
}

export const cartStore = {
    getItems(): CartItem[] {
        return loadCart();
    },

    getCount(): number {
        return loadCart().reduce((sum, item) => sum + item.quantity, 0);
    },

    add(product: Product, quantity = 1): void {
        const items = loadCart();
        const existing = items.find((i) => i.product.id === product.id);
        if (existing) {
            existing.quantity += quantity;
        } else {
            items.push({ product, quantity });
        }
        saveCart(items);
        notify();
    },

    remove(productId: string): void {
        const items = loadCart().filter((i) => i.product.id !== productId);
        saveCart(items);
        notify();
    },

    setQuantity(productId: string, quantity: number): void {
        if (quantity <= 0) {
            this.remove(productId);
            return;
        }
        const items = loadCart();
        const item = items.find((i) => i.product.id === productId);
        if (item) {
            item.quantity = quantity;
            saveCart(items);
            notify();
        }
    },

    clear(): void {
        saveCart([]);
        notify();
    },

    subscribe(listener: CartListener): () => void {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
};

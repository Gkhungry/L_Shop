import type { Router } from '../router';
import { cartStore } from '../store/cartStore';
import type { CartItem } from '../types/cart';

function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export class CartPage {
    private readonly root: HTMLElement;

    private readonly router: Router;

    private unsubscribe?: () => void;

    private mounted = false;

    constructor(root: HTMLElement, router: Router) {
        this.root = root;
        this.router = router;
    }

    public render(): void {
        this.mounted = true;
        this.root.innerHTML = '<h1>Корзина</h1><p class="info">Загрузка...</p>';
        this.renderContent();
        this.unsubscribe = cartStore.subscribe(() => {
            if (this.mounted) this.renderContent();
        });
    }

    public destroy(): void {
        this.mounted = false;
        this.unsubscribe?.();
    }

    private renderContent(): void {
        const items = cartStore.getItems();

        if (items.length === 0) {
            this.root.innerHTML = `
                <h1>Корзина</h1>
                <div class="cart-empty">
                    <p class="info">Корзина пуста</p>
                    <a href="#/catalog" class="btn-primary">Перейти в каталог</a>
                </div>
            `;
            const link = this.root.querySelector('a[href="#/catalog"]');
            link?.addEventListener('click', (e) => {
                e.preventDefault();
                this.router.navigate('/catalog');
            });
            return;
        }

        const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

        this.root.innerHTML = `
            <h1>Корзина</h1>
            <div class="cart-list">
                ${items.map((item) => this.renderCartItem(item)).join('')}
            </div>
            <div class="cart-footer">
                <div class="cart-total">
                    <span>Итого:</span>
                    <strong>${total.toLocaleString('ru-RU')} ₽</strong>
                </div>
                <button type="button" id="cart-clear" class="btn-secondary">Очистить корзину</button>
            </div>
        `;

        this.bindEvents();
    }

    private renderCartItem(item: CartItem): string {
        const { product, quantity } = item;
        const subtotal = product.price * quantity;
        return `
            <div class="cart-item" data-product-id="${escapeHtml(product.id)}">
                ${product.image ? `<img class="cart-item-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" />` : ''}
                <div class="cart-item-info">
                    <h3 class="cart-item-name">${escapeHtml(product.name)}</h3>
                    <div class="cart-item-meta">
                        <span class="product-category">${escapeHtml(product.category)}</span>
                        ${product.rarity ? `<span class="product-rarity rarity-${product.rarity.toLowerCase().replace(/\s+/g, '-')}">${escapeHtml(product.rarity)}</span>` : ''}
                    </div>
                    ${product.stolenFrom ? `<p class="cart-item-stolen">Украдено у: <span class="stolen-nickname">${escapeHtml(product.stolenFrom)}</span></p>` : ''}
                    <span class="cart-item-price">${product.price.toLocaleString('ru-RU')} ₽ × ${quantity} = ${subtotal.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button type="button" class="qty-btn" data-action="decrease" aria-label="Уменьшить">−</button>
                        <span class="qty-value">${quantity}</span>
                        <button type="button" class="qty-btn" data-action="increase" aria-label="Увеличить">+</button>
                    </div>
                    <button type="button" class="btn-remove" data-action="remove" aria-label="Удалить">✕</button>
                </div>
            </div>
        `;
    }

    private bindEvents(): void {
        this.root.querySelectorAll('.cart-item').forEach((el) => {
            const productId = (el as HTMLElement).dataset.productId;
            if (!productId) return;

            const decreaseBtn = el.querySelector('[data-action="decrease"]');
            const increaseBtn = el.querySelector('[data-action="increase"]');
            const removeBtn = el.querySelector('[data-action="remove"]');

            decreaseBtn?.addEventListener('click', () => {
                const item = cartStore.getItems().find((i) => i.product.id === productId);
                if (item) cartStore.setQuantity(productId, item.quantity - 1);
            });

            increaseBtn?.addEventListener('click', () => {
                const item = cartStore.getItems().find((i) => i.product.id === productId);
                if (item) cartStore.setQuantity(productId, item.quantity + 1);
            });

            removeBtn?.addEventListener('click', () => cartStore.remove(productId));
        });

        document.getElementById('cart-clear')?.addEventListener('click', () => {
            cartStore.clear();
        });
    }
}

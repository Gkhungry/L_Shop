import type { Router } from '../router';
import { authSession } from '../auth/session';
import { fetchMyDeliveries } from '../api/deliveryApi';

function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export class PurchasesPage {
    private readonly root: HTMLElement;

    private readonly router: Router;

    constructor(root: HTMLElement, router: Router) {
        this.root = root;
        this.router = router;
    }

    public async render(): Promise<void> {
        const user = await authSession.ensureUser();
        if (!user) {
            this.router.navigate('/login');
            return;
        }

        this.root.innerHTML = '<h1>История покупок</h1><p class="info">Загрузка доставок...</p>';

        try {
            const deliveries = await fetchMyDeliveries();

            if (deliveries.length === 0) {
                this.root.innerHTML = `
                    <h1>История покупок</h1>
                    <p class="info">У вас пока нет оформленных доставок.</p>
                `;
                return;
            }

            this.root.innerHTML = `
                <h1>История покупок</h1>
                <div class="purchases-list">
                    ${deliveries
                        .map(
                            (delivery) => `
                                <article class="purchase-card">
                                    <div class="purchase-card-header">
                                        <div>
                                            <h2>Заказ от ${new Date(delivery.createdAt).toLocaleString('ru-RU')}</h2>
                                            <p class="info">Статус: ${delivery.status === 'processing' ? 'В обработке' : 'Завершён'}</p>
                                        </div>
                                        <strong>${delivery.total.toLocaleString('ru-RU')} ₽</strong>
                                    </div>
                                    <p><strong>Адрес:</strong> ${escapeHtml(delivery.address.fullAddress)}</p>
                                    <p><strong>Контакты:</strong> ${escapeHtml(delivery.address.recipientPhone)} / ${escapeHtml(delivery.address.recipientEmail)}</p>
                                    <p><strong>Оплата:</strong> ${this.getPaymentLabel(delivery.payment.method)}${delivery.payment.cardLast4 ? `, карта **** ${escapeHtml(delivery.payment.cardLast4)}` : ''}</p>
                                    <div class="purchase-items">
                                        ${delivery.items
                                            .map(
                                                (item) => `
                                                    <div class="purchase-item">
                                                        <span>${escapeHtml(item.name)} x ${item.quantity}</span>
                                                        <strong>${(item.price * item.quantity).toLocaleString('ru-RU')} ₽</strong>
                                                    </div>
                                                `,
                                            )
                                            .join('')}
                                    </div>
                                </article>
                            `,
                        )
                        .join('')}
                </div>
            `;
        } catch (error: unknown) {
            this.root.innerHTML = `
                <h1>История покупок</h1>
                <p class="error">Не удалось загрузить доставки: ${(error as Error).message}</p>
            `;
        }
    }

    private getPaymentLabel(method: 'card' | 'cash' | 'sbp'): string {
        if (method === 'card') {
            return 'Банковская карта';
        }

        if (method === 'sbp') {
            return 'СБП';
        }

        return 'Наличные';
    }
}


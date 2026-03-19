import type { Router } from '../router';
import { authSession } from '../auth/session';
import { cartStore } from '../store/cartStore';
import { createDelivery } from '../api/deliveryApi';
import type { PaymentMethod } from '../types/delivery';

function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export class DeliveryPage {
    private readonly root: HTMLElement;

    private readonly router: Router;

    private captchaLeft = 0;

    private captchaRight = 0;

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

        const items = cartStore.getItems();
        if (items.length === 0) {
            this.root.innerHTML = `
                <h1>Оформление доставки</h1>
                <p class="info">Корзина пуста. Сначала добавьте товары.</p>
                <button type="button" id="go-to-catalog">Перейти в каталог</button>
            `;

            document.getElementById('go-to-catalog')?.addEventListener('click', () => {
                this.router.navigate('/catalog');
            });
            return;
        }

        this.generateCaptcha();

        const total = items.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0,
        );

        this.root.innerHTML = `
            <h1>Оформление доставки</h1>
            <div class="delivery-layout">
                <form id="delivery-form" class="delivery-form" data-delivery="form">
                    <div class="delivery-section">
                        <h2>Данные получателя</h2>
                        <div>
                            <label for="delivery-address">Адрес доставки</label>
                            <input id="delivery-address" name="address" type="text" required placeholder="Город, улица, дом, квартира" />
                        </div>
                        <div>
                            <label for="delivery-phone">Телефон</label>
                            <input id="delivery-phone" name="phone" type="tel" required value="${escapeHtml(user.phone)}" />
                        </div>
                        <div>
                            <label for="delivery-email">Email</label>
                            <input id="delivery-email" name="email" type="email" required value="${escapeHtml(user.email)}" />
                        </div>
                        <div>
                            <label for="delivery-comment">Комментарий к заказу</label>
                            <input id="delivery-comment" name="comment" type="text" placeholder="Например, позвонить за 10 минут" />
                        </div>
                    </div>

                    <div class="delivery-section">
                        <h2>Оплата</h2>
                        <div>
                            <label for="payment-method">Способ оплаты</label>
                            <select id="payment-method" name="paymentMethod">
                                <option value="card">Банковская карта</option>
                                <option value="sbp">СБП</option>
                                <option value="cash">Наличные при получении</option>
                            </select>
                        </div>
                        <div id="card-fields">
                            <div>
                                <label for="cardholder-name">Имя владельца карты</label>
                                <input id="cardholder-name" name="cardholderName" type="text" placeholder="IVAN IVANOV" />
                            </div>
                            <div>
                                <label for="card-number">Номер карты</label>
                                <input id="card-number" name="cardNumber" type="text" inputmode="numeric" placeholder="1111 2222 3333 4444" />
                            </div>
                        </div>
                    </div>

                    <div class="delivery-section">
                        <h2>Подтверждение</h2>
                        <div class="captcha-box">
                            <p class="captcha-question">Решите пример: <strong>${this.captchaLeft} + ${this.captchaRight}</strong></p>
                            <input id="captcha-answer" name="captchaAnswer" type="number" required placeholder="Введите ответ" />
                        </div>
                    </div>

                    <button type="submit">Подтвердить оплату и доставку</button>
                    <p id="delivery-error" class="error-text"></p>
                    <p id="delivery-success" class="success-text"></p>
                </form>

                <aside class="delivery-summary">
                    <h2>Ваш заказ</h2>
                    <div class="delivery-summary-list">
                        ${items
                            .map(
                                (item) => `
                                    <div class="delivery-summary-item">
                                        <span>${escapeHtml(item.product.name)} x ${item.quantity}</span>
                                        <strong>${(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽</strong>
                                    </div>
                                `,
                            )
                            .join('')}
                    </div>
                    <div class="delivery-summary-total">
                        <span>Итого к оплате</span>
                        <strong>${total.toLocaleString('ru-RU')} ₽</strong>
                    </div>
                </aside>
            </div>
        `;

        this.bindEvents();
    }

    private bindEvents(): void {
        const form = document.getElementById('delivery-form') as HTMLFormElement | null;
        const paymentMethodSelect = document.getElementById(
            'payment-method',
        ) as HTMLSelectElement | null;

        if (!form || !paymentMethodSelect) {
            return;
        }

        this.updatePaymentFields(paymentMethodSelect.value as PaymentMethod);

        paymentMethodSelect.addEventListener('change', () => {
            this.updatePaymentFields(paymentMethodSelect.value as PaymentMethod);
        });

        form.addEventListener('submit', async (event: SubmitEvent) => {
            event.preventDefault();

            const errorEl = document.getElementById('delivery-error');
            const successEl = document.getElementById('delivery-success');

            if (errorEl) {
                errorEl.textContent = '';
            }
            if (successEl) {
                successEl.textContent = '';
            }

            const formData = new FormData(form);
            const captchaAnswer = Number(formData.get('captchaAnswer') ?? '');

            if (captchaAnswer !== this.captchaLeft + this.captchaRight) {
                if (errorEl) {
                    errorEl.textContent = 'Капча решена неверно. Проверьте расчёт.';
                }
                return;
            }

            const paymentMethod = String(
                formData.get('paymentMethod') ?? 'card',
            ) as PaymentMethod;
            const items = cartStore.getItems();

            try {
                await createDelivery({
                    items: items.map((item) => ({
                        productId: item.product.id,
                        name: item.product.name,
                        price: item.product.price,
                        quantity: item.quantity,
                    })),
                    address: {
                        fullAddress: String(formData.get('address') ?? ''),
                        recipientPhone: String(formData.get('phone') ?? ''),
                        recipientEmail: String(formData.get('email') ?? ''),
                        comment: String(formData.get('comment') ?? ''),
                    },
                    payment: {
                        method: paymentMethod,
                        cardholderName:
                            paymentMethod === 'card'
                                ? String(formData.get('cardholderName') ?? '')
                                : undefined,
                        cardNumber:
                            paymentMethod === 'card'
                                ? String(formData.get('cardNumber') ?? '')
                                : undefined,
                    },
                });

                cartStore.clear();

                if (successEl) {
                    successEl.textContent =
                        'Доставка успешно оформлена. Корзина очищена.';
                }

                window.setTimeout(() => {
                    this.router.navigate('/purchases');
                }, 700);
            } catch (error: unknown) {
                if (errorEl) {
                    errorEl.textContent = (error as Error).message;
                }
            }
        });
    }

    private updatePaymentFields(method: PaymentMethod): void {
        const cardFields = document.getElementById('card-fields');
        const cardholderInput = document.getElementById(
            'cardholder-name',
        ) as HTMLInputElement | null;
        const cardNumberInput = document.getElementById(
            'card-number',
        ) as HTMLInputElement | null;

        const isCard = method === 'card';

        if (cardFields) {
            cardFields.toggleAttribute('hidden', !isCard);
        }

        if (cardholderInput) {
            cardholderInput.required = isCard;
        }

        if (cardNumberInput) {
            cardNumberInput.required = isCard;
        }
    }

    private generateCaptcha(): void {
        this.captchaLeft = Math.floor(Math.random() * 8) + 2;
        this.captchaRight = Math.floor(Math.random() * 8) + 1;
    }
}

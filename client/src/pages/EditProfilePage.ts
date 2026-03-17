import type { Router } from '../router';
import { authSession } from '../auth/session';

function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export class EditProfilePage {
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

        this.root.innerHTML = `
            <h1>Редактирование профиля</h1>
            <p class="info">Сохранение пока не реализовано.</p>
            <form id="edit-profile-form">
                <div>
                    <label>Имя</label>
                    <input type="text" name="name" value="${escapeHtml(user.name)}" required />
                </div>
                <div>
                    <label>Email</label>
                    <input type="email" name="email" value="${escapeHtml(user.email)}" required />
                </div>
                <div>
                    <label>Логин</label>
                    <input type="text" name="login" value="${escapeHtml(user.login)}" required />
                </div>
                <div>
                    <label>Телефон</label>
                    <input type="tel" name="phone" value="${escapeHtml(user.phone)}" required />
                </div>
                <button type="submit">Сохранить</button>
                <button type="button" class="btn-secondary" id="cancel-edit">Отмена</button>
            </form>
            <p id="edit-profile-info" class="info"></p>
        `;

        const form = document.getElementById('edit-profile-form') as HTMLFormElement | null;
        const infoEl = document.getElementById('edit-profile-info');
        const cancelBtn = document.getElementById('cancel-edit');

        cancelBtn?.addEventListener('click', () => this.router.navigate('/profile'));

        form?.addEventListener('submit', (event: Event) => {
            event.preventDefault();
            if (infoEl) {
                infoEl.textContent = 'Пока нет API для обновления профиля.';
            }
        });
    }
}


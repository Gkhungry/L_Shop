import type { Router } from '../router';
import { authSession } from '../auth/session';

function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export class ProfilePage {
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
            <h1>Профиль</h1>
            <div class="user-card">
                <p><strong>${escapeHtml(user.name)}</strong></p>
                <p>${escapeHtml(user.email)}</p>
                <p>${escapeHtml(user.login)}</p>
                <p>${escapeHtml(user.phone)}</p>
            </div>
            <button type="button" id="go-edit-profile">Редактировать профиль</button>
        `;

        const btn = document.getElementById('go-edit-profile');
        btn?.addEventListener('click', () => this.router.navigate('/profile/edit'));
    }
}


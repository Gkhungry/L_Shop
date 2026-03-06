import { currentUser, logout } from '../api/authApi';
import type { Router } from '../router';

export class HomePage {
    private readonly root: HTMLElement;

    private readonly router: Router;

    constructor(root: HTMLElement, router: Router) {
        this.root = root;
        this.router = router;
    }

    public async render(): Promise<void> {
        const user = await currentUser();

        if (!user) {
            this.root.innerHTML = `
        <h1>Главная</h1>
        <p>Вы не авторизованы.</p>
        <button id="go-login">Перейти к логину</button>
      `;
            const btn = document.getElementById('go-login');
            btn?.addEventListener('click', () => this.router.navigate('/login'));
            return;
        }

        this.root.innerHTML = `
      <h1>Главная</h1>
      <div class="user-card">
        <p>Вы вошли как <strong>${user.name}</strong></p>
        <p>${user.email}</p>
      </div>
      <button id="logout">Выйти</button>
    `;

        const logoutBtn = document.getElementById('logout');
        logoutBtn?.addEventListener('click', async () => {
            await logout();
            this.router.navigate('/login');
        });
    }
}

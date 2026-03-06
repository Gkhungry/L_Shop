import { login } from '../api/authApi';
import type { Router } from '../router';

export class LoginPage {
    private readonly root: HTMLElement;

    private readonly router: Router;

    constructor(root: HTMLElement, router: Router) {
        this.root = root;
        this.router = router;
    }

    public render(): void {
        this.root.innerHTML = `
      <h1>Логин</h1>
      <form id="login-form">
        <div>
          <label>Логин / Email / Телефон</label>
          <input type="text" name="identifier" required />
        </div>
        <div>
          <label>Пароль</label>
          <input type="password" name="password" required />
        </div>
        <button type="submit">Войти</button>
      </form>
      <p id="login-error"></p>
    `;

        const form = document.getElementById('login-form') as HTMLFormElement | null;
        const errorEl = document.getElementById('login-error');

        if (!form || !errorEl) {
            return;
        }

        form.addEventListener('submit', async (event: Event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const identifier = String(formData.get('identifier') ?? '');
            const password = String(formData.get('password') ?? '');

            try {
                await login({ loginOrEmailOrPhone: identifier, password });
                this.router.navigate('/');
            } catch (e: unknown) {
                errorEl.textContent = (e as Error).message;
            }
        });
    }
}

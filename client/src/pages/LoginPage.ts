import { login } from '../api/authApi';
import { authSession } from '../auth/session';
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
      <h1>Вход</h1>
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
      <p class="info"><a href="#/register">Нет аккаунта? Зарегистрироваться</a></p>
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
                const user = await login({ loginOrEmailOrPhone: identifier, password });
                authSession.setUser(user);
                this.router.navigate('/catalog');
            } catch (e: unknown) {
                errorEl.textContent = (e as Error).message;
            }
        });
    }
}

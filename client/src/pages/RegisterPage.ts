import { register } from '../api/authApi';
import { authSession } from '../auth/session';
import type { Router } from '../router';

export class RegisterPage {
    private readonly root: HTMLElement;

    private readonly router: Router;

    constructor(root: HTMLElement, router: Router) {
        this.root = root;
        this.router = router;
    }

    public render(): void {
        this.root.innerHTML = `
      <h1>Регистрация</h1>
      <form id="register-form" data-registration>
        <div>
          <label>Имя</label>
          <input type="text" name="name" required />
        </div>
        <div>
          <label>Email</label>
          <input type="email" name="email" required />
        </div>
        <div>
          <label>Логин</label>
          <input type="text" name="login" required />
        </div>
        <div>
          <label>Телефон</label>
          <input type="tel" name="phone" required />
        </div>
        <div>
          <label>Пароль</label>
          <input type="password" name="password" required />
        </div>
        <button type="submit">Зарегистрироваться</button>
      </form>
      <p class="info"><a href="#/login">Уже есть аккаунт? Войти</a></p>
      <p id="register-error"></p>
    `;

        const form = document.getElementById('register-form') as HTMLFormElement | null;
        const errorEl = document.getElementById('register-error');

        if (!form || !errorEl) {
            return;
        }

        form.addEventListener('submit', async (event: Event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const name = String(formData.get('name') ?? '');
            const email = String(formData.get('email') ?? '');
            const loginValue = String(formData.get('login') ?? '');
            const phone = String(formData.get('phone') ?? '');
            const password = String(formData.get('password') ?? '');

            try {
                const user = await register({
                    name,
                    email,
                    login: loginValue,
                    phone,
                    password,
                });
                authSession.setUser(user);
                this.router.navigate('/catalog');
            } catch (e: unknown) {
                errorEl.textContent = (e as Error).message;
            }
        });
    }
}

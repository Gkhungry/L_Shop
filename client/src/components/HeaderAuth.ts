import { logout } from '../api/authApi';
import type { AuthSession } from '../auth/authSession';
import type { Router } from '../router';

function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export class HeaderAuth {
    private readonly container: HTMLElement;

    private readonly router: Router;

    private readonly session: AuthSession;

    private menuOpen = false;

    constructor(container: HTMLElement, router: Router, session: AuthSession) {
        this.container = container;
        this.router = router;
        this.session = session;
    }

    public start(): void {
        void this.refresh();

        document.addEventListener('click', (event: MouseEvent) => {
            if (!this.menuOpen) {
                return;
            }

            const target = event.target as Node | null;
            if (!target) {
                return;
            }

            if (!this.container.contains(target)) {
                this.closeMenu();
            }
        });

        window.addEventListener('hashchange', () => {
            this.closeMenu();
            void this.refresh();
        });
    }

    public async refresh(): Promise<void> {
        await this.session.ensureUser();
        this.render();
    }

    private render(): void {
        const user = this.session.getUser();

        if (!user) {
            this.renderLoggedOut();
            return;
        }

        this.renderLoggedIn(user.name);
        this.updateMenuVisibility();
    }

    private renderLoggedOut(): void {
        this.menuOpen = false;
        this.container.innerHTML = `<button class="nav-action" type="button" id="nav-login">Войти</button>`;

        const btn = document.getElementById('nav-login');
        btn?.addEventListener('click', (e: MouseEvent) => {
            e.preventDefault();
            this.router.navigate('/login');
        });
    }

    private renderLoggedIn(userName: string): void {
        const safeName = escapeHtml(userName);

        this.container.innerHTML = `
            <button
                class="nav-action"
                type="button"
                id="nav-profile"
                aria-haspopup="menu"
                aria-expanded="${this.menuOpen ? 'true' : 'false'}"
            >
                ${safeName}
            </button>
            <div class="nav-menu" role="menu" id="nav-menu" ${this.menuOpen ? '' : 'hidden'}>
                <a role="menuitem" href="#/profile" data-nav-close>Профиль</a>
                <a role="menuitem" href="#/profile/edit" data-nav-close>Редактирование профиля</a>
                <a role="menuitem" href="#/purchases" data-nav-close>История покупок</a>
                <div class="nav-menu-sep"></div>
                <button role="menuitem" type="button" id="nav-logout">Выйти</button>
            </div>
        `;

        const profileBtn = document.getElementById('nav-profile');
        profileBtn?.addEventListener('click', (e: MouseEvent) => {
            e.preventDefault();
            this.menuOpen = !this.menuOpen;
            this.updateMenuVisibility();
        });

        const closeLinks = this.container.querySelectorAll('[data-nav-close]');
        closeLinks.forEach((el) => {
            el.addEventListener('click', () => {
                this.closeMenu();
            });
        });

        const logoutBtn = document.getElementById('nav-logout');
        logoutBtn?.addEventListener('click', async () => {
            await logout();
            this.session.clear();
            this.menuOpen = false;
            await this.refresh();
            this.router.navigate('/catalog');
        });
    }

    private updateMenuVisibility(): void {
        const profileBtn = document.getElementById('nav-profile');
        const menu = document.getElementById('nav-menu');

        if (profileBtn) {
            profileBtn.setAttribute('aria-expanded', this.menuOpen ? 'true' : 'false');
        }

        if (menu) {
            if (this.menuOpen) {
                menu.removeAttribute('hidden');
            } else {
                menu.setAttribute('hidden', 'true');
            }
        }
    }

    private closeMenu(): void {
        if (!this.menuOpen) {
            return;
        }
        this.menuOpen = false;
        this.updateMenuVisibility();
    }
}


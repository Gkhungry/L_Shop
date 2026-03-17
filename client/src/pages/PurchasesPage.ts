import type { Router } from '../router';
import { authSession } from '../auth/session';

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

        this.root.innerHTML = `
            <h1>История покупок</h1>
            <p class="info">Страница в разработке.</p>
        `;
    }
}


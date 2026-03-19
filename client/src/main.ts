import { Router } from './router';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { CatalogPage } from './pages/CatalogPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { PurchasesPage } from './pages/PurchasesPage';
import { CartPage } from './pages/CartPage';
import { authSession } from './auth/session';
import { HeaderAuth } from './components/HeaderAuth';
import { cartStore } from './store/cartStore';

function bootstrap(): void {
    const root = document.getElementById('app');
    const navAuth = document.getElementById('nav-auth');

    if (!root) {
        throw new Error('Root element #app not found');
    }

    if (!navAuth) {
        throw new Error('Nav auth element #nav-auth not found');
    }

    let router: Router;

    const renderRoot = (): void => {
        router.navigate('/catalog');
    };

    const renderRegister = (): void => {
        void (async () => {
            const user = await authSession.ensureUser();
            if (user) {
                router.navigate('/catalog');
                return;
            }

            const page = new RegisterPage(root, router);
            page.render();
        })();
    };

    const renderLogin = (): void => {
        void (async () => {
            const user = await authSession.ensureUser();
            if (user) {
                router.navigate('/catalog');
                return;
            }

            const page = new LoginPage(root, router);
            page.render();
        })();
    };

    const renderCatalog = (): void => {
        const page = new CatalogPage(root);
        void page.render();
    };

    const renderProfile = (): void => {
        void (async () => {
            const user = await authSession.ensureUser();
            if (!user) {
                router.navigate('/login');
                return;
            }

            const page = new ProfilePage(root, router);
            void page.render();
        })();
    };

    const renderEditProfile = (): void => {
        void (async () => {
            const user = await authSession.ensureUser();
            if (!user) {
                router.navigate('/login');
                return;
            }

            const page = new EditProfilePage(root, router);
            void page.render();
        })();
    };

    const renderPurchases = (): void => {
        void (async () => {
            const user = await authSession.ensureUser();
            if (!user) {
                router.navigate('/login');
                return;
            }

            const page = new PurchasesPage(root, router);
            void page.render();
        })();
    };

    let cartPageInstance: CartPage | null = null;

    const cleanupCartPage = (): void => {
        if (cartPageInstance) {
            cartPageInstance.destroy();
            cartPageInstance = null;
        }
    };

    const renderCart = (): void => {
        cleanupCartPage();
        cartPageInstance = new CartPage(root, router);
        cartPageInstance.render();
    };

    const updateCartBadge = (): void => {
        const badge = document.getElementById('cart-badge');
        if (badge) badge.textContent = String(cartStore.getCount());
    };

    const wrapHandler = (handler: () => void): (() => void) => {
        return () => {
            cleanupCartPage();
            handler();
        };
    };

    router = new Router(
        [
            { path: '/', handler: wrapHandler(renderRoot) },
            { path: '/register', handler: wrapHandler(renderRegister) },
            { path: '/login', handler: wrapHandler(renderLogin) },
            { path: '/catalog', handler: wrapHandler(renderCatalog) },
            { path: '/cart', handler: renderCart },
            { path: '/profile', handler: wrapHandler(renderProfile) },
            { path: '/profile/edit', handler: wrapHandler(renderEditProfile) },
            { path: '/purchases', handler: wrapHandler(renderPurchases) },
        ],
        () => {
            cleanupCartPage();
            root.innerHTML = '<h1>Страница не найдена</h1>';
        },
    );

    const header = new HeaderAuth(navAuth, router, authSession);
    header.start();

    updateCartBadge();
    cartStore.subscribe(updateCartBadge);

    router.start();
}

document.addEventListener('DOMContentLoaded', () => {
    bootstrap();
});

import { Router } from './router';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { CatalogPage } from './pages/CatalogPage';
import { ProfilePage } from './pages/ProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { PurchasesPage } from './pages/PurchasesPage';
import { authSession } from './auth/session';
import { HeaderAuth } from './components/HeaderAuth';

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

    router = new Router(
        [
            { path: '/', handler: renderRoot },
            { path: '/register', handler: renderRegister },
            { path: '/login', handler: renderLogin },
            { path: '/catalog', handler: renderCatalog },
            { path: '/profile', handler: renderProfile },
            { path: '/profile/edit', handler: renderEditProfile },
            { path: '/purchases', handler: renderPurchases },
        ],
        () => {
            root.innerHTML = '<h1>404</h1>';
        },
    );

    const header = new HeaderAuth(navAuth, router, authSession);
    header.start();

    router.start();
}

document.addEventListener('DOMContentLoaded', () => {
    bootstrap();
});

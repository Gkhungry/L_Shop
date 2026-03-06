type RouteHandler = () => void;

interface RouteConfig {
    path: string;
    handler: RouteHandler;
}

export class Router {
    private readonly routes: RouteConfig[];

    private readonly notFoundHandler: RouteHandler;

    constructor(routes: RouteConfig[], notFoundHandler: RouteHandler) {
        this.routes = routes;
        this.notFoundHandler = notFoundHandler;
    }

    public start(): void {
        window.addEventListener('hashchange', () => {
            this.resolve();
        });
        this.resolve();
    }

    private resolve(): void {
        const hash = window.location.hash || '#/';
        const path = hash.replace(/^#/, '');
        const match = this.routes.find((route) => route.path === path);
        if (match) {
            match.handler();
        } else {
            this.notFoundHandler();
        }
    }

    public navigate(path: string): void {
        window.location.hash = path;
    }
}

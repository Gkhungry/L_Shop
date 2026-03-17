import { currentUser } from '../api/authApi';
import type { User } from '../types/user';

type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated';

export class AuthSession {
    private status: AuthStatus = 'unknown';

    private user: User | null = null;

    public getUser(): User | null {
        return this.user;
    }

    public async ensureUser(): Promise<User | null> {
        if (this.status !== 'unknown') {
            return this.user;
        }

        const user = await currentUser();
        this.user = user;
        this.status = user ? 'authenticated' : 'unauthenticated';
        return this.user;
    }

    public setUser(user: User): void {
        this.user = user;
        this.status = 'authenticated';
    }

    public clear(): void {
        this.user = null;
        this.status = 'unauthenticated';
    }
}


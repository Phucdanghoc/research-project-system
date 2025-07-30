export class TokenService {
    static getToken(): string | null {
        return localStorage.getItem('token');
    }
    static setToken(token: string) {
        localStorage.setItem('token', token);
    }
    static removeToken() {
        localStorage.removeItem('user_data');
        localStorage.removeItem('token');
    }
    static setUser(user: any) {
        localStorage.setItem('user_data', JSON.stringify(user));
    }
    static getUser(): any {
        const user = localStorage.getItem('user_data');
        return user ? JSON.parse(user) : null;
    }
}
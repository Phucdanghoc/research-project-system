export class TokenService {
    static getToken(): string | null {
        return localStorage.getItem('token');
    }
    static setToken(token: string) {
        localStorage.setItem('token', token);
    }
    static removeToken() {
        localStorage.removeItem('token');
    }
}
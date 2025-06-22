export interface UserLogin {
    username: string;
    password: string;
}
export interface UserRegister {
    username: string;
    password: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
}
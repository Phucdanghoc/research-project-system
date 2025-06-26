export interface UserLogin {
    email: string;
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
    name: string;
    gender: string;
    phone : string;
    birth: string;
    student_code: string;
    class_name: string;
    facaulty: string;
    major: string;
    lecturer_code: string;
    groups: [any];
    lectures_groups: [any];
} 

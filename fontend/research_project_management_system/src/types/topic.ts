import type { Group } from "./group";


export interface Topic {
    id: number;
    title: string;
    topic_code: string;
    description: string;
    requirement: string;
    topic_quantity: number;
    student_quantity: number;
    status: string;
    created_at: string;
    updated_at: string;
    lecturer_id: number | null;
    category: any | null;
    groups: Group[];
}

export interface TopicGeneral {
    lecturer_id: number
    quantity: number
}
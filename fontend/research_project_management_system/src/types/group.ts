export interface Group {
  id: number;
  name: string;
  lecturer_id: number;
  created_at: string;
  updated_at: string;
  defense_id: number;
}

export interface GroupState {
  groups: Group[];
  loading: boolean;
  total_pages: number;
  current_page: number;
  error: string | null;
}
export interface GroupDetail {
  id: number;
  name: string;
  lecturer_id: number;
  created_at: string;
  updated_at: string;
  defense_id: number;
  status : string;
  lecturer: any;
  students: any[];
}

export interface GroupForm {
  name: string;
  topic_id: number;
  student_ids:  number[];
}
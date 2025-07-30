export interface Defense {
    id: number;
    name: string;
    defense_code: string;
    lecturer_ids: number[];
    start_time: string;
    date: string;
    end_time: string;
    status: string;
    group_ids: number[];   
}
// "defense": {
//     "name": "Council A",
//     "status": 1,
//     "group_id": 12,
//     "date": "2025-07-30",
//     "start_time": "08:00",
//     "end_time": "09:30",
//     "lecturer_ids": [3, 5]
//   }
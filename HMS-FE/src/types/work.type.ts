export type WorkScheduleBase = {
  id: number;
  user_id: number;
  user_name: string;
  clinic_id: number;
  work_date: string; // ISO format
  shift_id: number;
  shift_name: string;
};
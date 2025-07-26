// model Queue {
//     id                Int         @id @default(autoincrement())
//     patient_id        Int
//     clinic_id         Int
//     record_id         Int?
//     status            QueueStatus @default(waiting)
//     priority          Int         @default(0)
//     registered_online Boolean     @default(false)
//     qr_code           String?
//     called_at         DateTime?
//     created_at        DateTime    @default(now())

import type { Patient } from "./patient.type";
import type { ReactNode } from 'react';

//     patient Patient            @relation(fields: [patient_id], references: [id])
//     clinic  Clinic             @relation(fields: [clinic_id], references: [id])
//     record  ExaminationRecord? @relation(fields: [record_id], references: [id])

//     @@map("queues")
//   }

export interface IQueue {
  appointment: any;
  // slot_date: ReactNode;
  shift_type: any;
  queue_number: number;
  id: number;
  patient_id: number;
  clinic_id: number;
  record_id: number;
  status: string;
  priority: number;
  registered_online: boolean;
  qr_code: string;
  called_at: string;
  created_at: string;
  patient: Patient;
}
export const getQueueStatus = (status: string) => {
  switch (status) {
    case "waiting":
      return "Chờ khám";
    case "in_progress":
      return "Đang khám";
    case "done":
      return "Đã khám";
    case "skipped":
      return "Bỏ qua";
    default:
      return "Không xác định";
  }
};

import { DEFAULT_PAGINATION } from "@/constants/data.const";
import type { IPagination } from "@/types/app.type";
import type { IQueue } from "@/types/queue.type";
import { create } from "zustand";

interface QueueState {
  queues: IQueue[];
  setQueues: (queues: IQueue[]) => void;
  filter: {
    status: string;
  };
  totalElements: number;
  setTotalElements: (totalElements: number) => void;
  totalPages: number;
  setTotalPages: (totalPages: number) => void;
  pagination: IPagination;
  setPagination: (pagination: IPagination) => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  queues: [],
  setQueues: (queues) => set({ queues }),
  filter: {
    status: "",
  },
  totalElements: 0,
  setTotalElements: (totalElements) => set({ totalElements }),
  totalPages: 0,
  setTotalPages: (totalPages) => set({ totalPages }),
  pagination: DEFAULT_PAGINATION,
  setPagination: (pagination) => set({ pagination }),
}));

// src/store/authStore.ts
import { create } from "zustand";

export type Role = "admin" | "staff" | "doctor" | "customer";

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    role: Role;
  } | null;
  login: (userData: AuthState["user"], token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true,
  user: {
    id: "1",
    name: "John Doe",
    role: "admin",
  },
  login: (user, token) => {
    set({ isAuthenticated: true, user });
    localStorage.setItem("token", token);
  },
  logout: () => {
    set({ isAuthenticated: false, user: null });
    localStorage.removeItem("token");
  },
}));

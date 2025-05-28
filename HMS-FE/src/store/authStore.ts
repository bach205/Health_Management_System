// src/store/authStore.ts
import { create } from "zustand";

export type Role = "admin" | "nurse" | "doctor" | "customer" | "patient";

const isAuth = localStorage.getItem("isAuth") === "true" ? true : false;
const userD = localStorage.getItem("user");

interface AuthState {
  isAuthenticated: boolean | false;
  user: {
    id: string;
    name: string;
    role: Role;
  } | null;
  login: (userData: AuthState["user"], token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: isAuth,
  user: userD ? JSON.parse(userD) : null,
  login: (userData, token) => {
    set(() => ({isAuthenticated:true ,user : userData}));
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("isAuth", "true");
  },
  logout: () => {
    set({ isAuthenticated: false, user: null });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.setItem("isAuth", "false");
  },
}));

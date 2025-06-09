// src/store/authStore.ts
import { create } from "zustand";

export type Role = "admin" | "nurse" | "doctor" | "customer" | "patient";

const isAuth = localStorage.getItem("isAuth") === "true" ? true : false;
const userD = localStorage.getItem("user");

let parsedUser = null;
try {
  if (userD) {
    parsedUser = JSON.parse(userD);
  }
} catch (error) {
  console.error("Error parsing user data from localStorage:", error);
  // Clear invalid data
  localStorage.removeItem("user");
  localStorage.setItem("isAuth", "false");
}

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
  isAuthenticated: parsedUser ? true : false,
  user: parsedUser,
  login: (userData, token) => {
    if (!userData) return;
    set(() => ({isAuthenticated: true, user: userData}));
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

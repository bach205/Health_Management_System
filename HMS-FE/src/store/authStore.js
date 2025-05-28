import { create } from "zustand";

export const useAuthStore = create((set) => ({
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
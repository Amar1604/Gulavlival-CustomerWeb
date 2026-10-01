import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CustomerUser } from "@/types";

interface AuthState {
  user: CustomerUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: CustomerUser, token: string) => void;
  updateUser: (updatedFields: Partial<CustomerUser>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("gg_access_token", token);
          localStorage.setItem("gg_user", JSON.stringify(user));
        }
        set({ user, token, isAuthenticated: true });
      },

      updateUser: (updatedFields) => {
        const currentUser = get().user;
        if (!currentUser) return;
        const updated = { ...currentUser, ...updatedFields };
        if (typeof window !== "undefined") {
          localStorage.setItem("gg_user", JSON.stringify(updated));
        }
        set({ user: updated });
      },

      logout: () => {

        if (typeof window !== "undefined") {
          localStorage.removeItem("gg_access_token");
          localStorage.removeItem("gg_user");
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "gulavlival-grand-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

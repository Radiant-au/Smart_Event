import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { LoginRequest } from "@/api/auth-api";

interface AuthContextProps {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const auth = useAuth(); // Using the simplified useAuth hook

  const memoizedAuth = useMemo(() => auth, [auth]);

  return (
    <AuthContext.Provider value={memoizedAuth}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { loginUser, LoginRequest } from "@/api/auth-api";

export const useAuth = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("code_jwt");
    setIsAuthenticated(!!token);
    setIsAuthLoading(false);
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const res = await loginUser(data);
      const token = res?.data?.data?.token;
      if (!token) {
        throw new Error("Token missing in response");
      }
      localStorage.setItem("code_jwt", token);
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Invalid credentials");
    }
  };

  const logout = () => {
    localStorage.removeItem("code_jwt");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return {
    isAuthenticated,
    isAuthLoading,
    login,
    logout,
  };
};

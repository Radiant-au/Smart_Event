import apiClient from "@/api/api-client";

/**
 * =====================
 *  Auth API Types
 * =====================
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

/**
 * =====================
 *  Auth API Calls
 * =====================
 */

// Register a new user
export const registerUser = async (data: RegisterRequest) => {
  const response = await apiClient.post("/auth/register", data);
  return response;
};

// Login user
export const loginUser = async (data: LoginRequest) => {
  const response = await apiClient.post("/auth/login", data);
  return response;
};

// Change password (requires authentication)
export const changePassword = async (data: ChangePasswordRequest) => {
  const response = await apiClient.post("/auth/change-password", data);
  return response;
};

// Reset password (requires authentication)
export const resetPassword = async (data: ResetPasswordRequest) => {
  const response = await apiClient.post("/auth/reset-password", data);
  return response;
};

// Get currently authenticated user
export const getCurrentUser = async () => {
  const response = await apiClient.get("/auth/me");
  return response;
};

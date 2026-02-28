'use client';
import axios from "axios";
import { RegisterDto, RegisterUserResponse, LoginDto, LoginResponse, User } from "@/app/types/Auth";
import { useAuthStore } from "@/stores/authStore";
import { API_BASE_URL } from "./config";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Ensures httpOnly cookies are sent/received on every request
});

/**
 * Register a new user
 */
export async function registerUser(data: RegisterDto): Promise<RegisterUserResponse> {
  try {
    const response = await api.post<RegisterUserResponse>('/auth/register', data);

    // Only store user + access token. Refresh token is set as an httpOnly cookie by the server.
    if (response.data.user && response.data.accessToken) {
      useAuthStore.getState().setAuth(response.data.user, {
        accessToken: response.data.accessToken,
      });
    }

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(message);
    }
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Login user
 */
export async function loginUser(data: LoginDto): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>('/auth/login', data);

    // Only store user + access token. Refresh token is set as an httpOnly cookie by the server.
    if (response.data.user && response.data.accessToken) {
      useAuthStore.getState().setAuth(response.data.user, {
        accessToken: response.data.accessToken,
      });
    }

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    }
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Logout user — clears local auth state AND tells the server to clear the httpOnly cookie
 */
export async function logoutUser(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // Even if the server call fails, clear local state
  } finally {
    useAuthStore.getState().clearAuth();
  }
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

/**
 * Get current user
 */
export function getCurrentUser() {
  return useAuthStore.getState().user;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return useAuthStore.getState().isAuthenticated;
}

/**
 * Initiate Google OAuth login
 */
export function loginWithGoogle(): void {
  window.location.href = `${API_BASE_URL}/auth/google`;
}

/**
 * Get the latest user profile from the server
 */
export async function fetchUserProfile(): Promise<User> {
  try {
    const response = await api.get<User>('/users/me');
    if (response.data) {
      useAuthStore.getState().updateUser(response.data);
    }
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch profile';
      throw new Error(message);
    }
    throw new Error('An unexpected error occurred');
  }
}

export { api };
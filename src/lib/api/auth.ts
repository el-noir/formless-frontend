'use client';
import axios from "axios";
import { RegisterDto, RegisterUserResponse, LoginDto, LoginResponse } from "@/app/types/Auth";

// Configure base URL for API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Register a new user
 * @param data - User registration data
 * @returns User data with authentication tokens
 */
export async function registerUser(data: RegisterDto): Promise<RegisterUserResponse> {
  try {
    const response = await api.post<RegisterUserResponse>('/auth/register', data);
    
    // Store tokens in localStorage
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
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
 * @param data - User login credentials
 * @returns User data with authentication tokens
 */
export async function loginUser(data: LoginDto): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>('/auth/login', data);
    
    // Store tokens in localStorage
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    if (response.data.refreshToken) {
      localStorage.setItem('refreshToken', response.data.refreshToken);
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
 * Logout user
 */
export function logoutUser(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

export { api };
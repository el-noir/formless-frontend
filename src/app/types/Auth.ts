export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  organizationEmail?: string;
  organizationPhone?: string;
  organizationAddress?: string;
  organizationCity?: string;
  organizationState?: string;
  organizationZip?: string;
  organizationCountry?: string;
  organizationWebsite?: string;
  organizationDescription?: string;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterUserResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
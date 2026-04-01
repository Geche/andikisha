export interface Employee {
  id: string;
  tenantId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  phoneNumber: string;
  email: string | null;
  kraPin: string;
  nhifNumber: string;
  nssfNumber: string;
  departmentId: string | null;
  departmentName: string | null;
  basicSalary: number;
  currency: string;
  status: EmploymentStatus;
  hireDate: string;
  terminationDate: string | null;
}

export type EmploymentStatus =
    | "ACTIVE"
    | "ON_PROBATION"
    | "ON_LEAVE"
    | "SUSPENDED"
    | "TERMINATED";

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  email: string;
  tenantId: string;
  role: string;
  employeeId: string | null;
}

// Pagination
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// API errors
export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
  fieldErrors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}
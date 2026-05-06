export interface SuperAdminSession {
  id: string;
  createdAt: string;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
  current: boolean;
}

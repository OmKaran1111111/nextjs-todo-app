export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  verified: number;
  isBanned?: number;
  createdAt: string;
  role: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  priority: string;
  dueDate: string | null;
  completed: number;
  createdAt: string;
}

export interface Device {
  id: string;
  userId: string;
  userAgent: string;
  deviceName?: string;
  appVersion?: string;
  revoked: number;
  createdAt: string;
}

export interface PairingCode {
  code: string;
  userId: string;
  expiresAt: string;
}
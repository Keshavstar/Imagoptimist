
export enum UserTier {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM'
}

export interface UserSession {
  tier: UserTier;
  licenseKey?: string;
  token?: string;
  expiresAt?: number;
}

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  originalSize: number;
  compressedSize?: number;
  resultUrl?: string;
}

export interface LicenseStatus {
  valid: boolean;
  tier: UserTier;
  token?: string;
  expiry?: number;
  message?: string;
}

export interface WorkerResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

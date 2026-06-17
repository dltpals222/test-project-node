export type IdentityStatus = 'VERIFIED' | 'FAILED' | 'CANCELLED';

export interface IdentityVerification {
  id: number;
  external_verification_id: string;
  phone: string;
  name: string | null;
  status: IdentityStatus;
  raw_response: unknown | null;
  verified_at: Date | null;
  record_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export type PartnerType = 'external' | 'internal';

export interface Partner {
  id: number;
  user_id: number;
  partner_type: PartnerType;
  name: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

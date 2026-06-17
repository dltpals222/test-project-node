import type { Role } from './auth';
import type { RecordStatus } from '@/features/records/types';

/** 백엔드 record_status → UI 한글 라벨 (스키마는 그대로, 표시만 매핑) */
export const STATUS_LABEL: Record<RecordStatus, string> = {
  new: '신규',
  assigned: '배정됨',
  in_progress: '진행중',
  completed: '완료',
  cancelled: '취소',
};

export const ROLE_LABEL: Record<Role, string> = {
  superadmin: '슈퍼관리자',
  admin: '관리자',
  manager: '담당자',
  member: '협력사',
};

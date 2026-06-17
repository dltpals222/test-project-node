import { IsEnum } from 'class-validator';
import { RECORD_STATUSES, RecordStatus } from '../entities/record.entity';

export class UpdateStatusDto {
  @IsEnum(RECORD_STATUSES, {
    message: 'status 는 new, assigned, in_progress, completed, cancelled 중 하나여야 합니다',
  })
  status: RecordStatus;
}

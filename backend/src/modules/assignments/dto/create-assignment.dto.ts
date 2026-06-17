import { IsInt, Min } from 'class-validator';

export class CreateAssignmentDto {
  @IsInt()
  @Min(1)
  record_id: number;

  @IsInt()
  @Min(1)
  partner_id: number;
}

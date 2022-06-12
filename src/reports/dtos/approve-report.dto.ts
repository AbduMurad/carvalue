import { IsBoolean } from 'class-validator';

export class ApproveReportDto {
  @IsBoolean()
  approved: boolean;
}

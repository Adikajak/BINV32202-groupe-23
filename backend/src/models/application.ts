import type { PeriodCode } from "./offer.ts";

export const APPLICATION_STATUSES = ["IN_PROGRESS", "SELECTED", "REJECTED", "WITHDRAWN"] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface ApplicationDbo {
  id: number;
  offer_id: number;
  student_id: number;
  message: string | null;
  status: ApplicationStatus;
  applied_at: string;
}

export interface Application {
  id: number;
  offerId: number;
  studentId: number;
  message: string | null;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface ApplicationDto {
  id: number;
  offerId: number;
  message: string | null;
  status: ApplicationStatus;
  appliedAt: string;
}

export interface ApplicationListDbo extends ApplicationDbo {
  offer_title: string;
  company_short_name: string;
  academic_year_label: string;
  period_code: PeriodCode;
}

export interface ApplicationListItem extends Application {
  offerTitle: string;
  companyShortName: string;
  academicYear: string;
  period: PeriodCode;
}

export interface ApplicationListItemDto extends ApplicationDto {
  offerTitle: string;
  companyShortName: string;
  academicYear: string;
  period: PeriodCode;
}

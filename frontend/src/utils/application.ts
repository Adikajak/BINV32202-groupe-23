import {
  APPLICATION_STATUSES,
  type Application,
  type ApplicationListItem,
} from "../models/application.ts";
import { PERIOD_CODES } from "../models/offer.ts";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const isApplication = (value: unknown): value is Application => {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "number" &&
    typeof record.offerId === "number" &&
    (record.message === null || typeof record.message === "string") &&
    typeof record.appliedAt === "string" &&
    typeof record.status === "string" &&
    (APPLICATION_STATUSES as readonly string[]).includes(record.status)
  );
};

export const isApplicationListItem = (value: unknown): value is ApplicationListItem =>
  isApplication(value) &&
  isRecord(value) &&
  typeof value.offerTitle === "string" &&
  typeof value.companyShortName === "string" &&
  typeof value.academicYear === "string" &&
  typeof value.period === "string" &&
  (PERIOD_CODES as readonly string[]).includes(value.period);

export const isApplicationList = (value: unknown): value is ApplicationListItem[] =>
  Array.isArray(value) && value.every(isApplicationListItem);

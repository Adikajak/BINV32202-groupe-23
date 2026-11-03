import { APPLICATION_STATUSES, type Application } from "../models/application.ts";

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

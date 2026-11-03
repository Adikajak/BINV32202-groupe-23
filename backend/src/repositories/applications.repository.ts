import type { Db } from "../db/database.ts";
import type { ApplicationDbo } from "../models/application.ts";

interface ApplicationParams {
  offerId: number;
  studentId: number;
  message: string | null;
}

interface StudentOfferParams {
  offerId: number;
  studentId: number;
}

export const createApplicationsRepository = (db: Db) => {
  const insert = db.prepare<ApplicationParams, ApplicationDbo>(`
    INSERT INTO applications (offer_id, student_id, message)
    SELECT @offerId, @studentId, @message
    WHERE NOT EXISTS (
      SELECT 1
      FROM applications
      WHERE offer_id = @offerId AND student_id = @studentId AND status = 'IN_PROGRESS'
    )
    RETURNING id, offer_id, student_id, message, status, applied_at
  `);
  const findById = db.prepare<{ id: number }, ApplicationDbo>(`
    SELECT id, offer_id, student_id, message, status, applied_at
    FROM applications
    WHERE id = @id
  `);
  const findLatestForOfferAndStudent = db.prepare<StudentOfferParams, ApplicationDbo>(`
    SELECT id, offer_id, student_id, message, status, applied_at
    FROM applications
    WHERE offer_id = @offerId AND student_id = @studentId
    ORDER BY id DESC
    LIMIT 1
  `);
  const withdraw = db.prepare<{ id: number }, ApplicationDbo>(`
    UPDATE applications
    SET status = 'WITHDRAWN'
    WHERE id = @id AND status = 'IN_PROGRESS'
    RETURNING id, offer_id, student_id, message, status, applied_at
  `);

  return {
    create: (
      offerId: number,
      studentId: number,
      message: string | null,
    ): ApplicationDbo | undefined => insert.get({ offerId, studentId, message }),
    findById: (id: number): ApplicationDbo | undefined => findById.get({ id }),
    findLatestForOfferAndStudent: (
      offerId: number,
      studentId: number,
    ): ApplicationDbo | undefined => findLatestForOfferAndStudent.get({ offerId, studentId }),
    withdraw: (id: number): ApplicationDbo | undefined => withdraw.get({ id }),
  };
};

export type ApplicationsRepository = ReturnType<typeof createApplicationsRepository>;

import type { Db } from "../db/database.ts";
import type { ApplicationDbo, ApplicationListDbo } from "../models/application.ts";

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
  const listForStudentCurrentYear = db.prepare<{ studentId: number }, ApplicationListDbo>(`
    SELECT a.id, a.offer_id, a.student_id, a.message, a.status, a.applied_at,
           o.title AS offer_title, c.short_name AS company_short_name,
           ay.label AS academic_year_label, p.code AS period_code
    FROM applications a
    JOIN offers o ON o.id = a.offer_id
    JOIN companies c ON c.id = o.company_id
    JOIN academic_years ay ON ay.id = o.academic_year_id
    JOIN periods p ON p.id = o.period_id
    WHERE a.student_id = @studentId AND ay.is_current = 1
    ORDER BY a.applied_at DESC, a.id DESC
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
    listForStudentCurrentYear: (studentId: number): ApplicationListDbo[] =>
      listForStudentCurrentYear.all({ studentId }),
  };
};

export type ApplicationsRepository = ReturnType<typeof createApplicationsRepository>;

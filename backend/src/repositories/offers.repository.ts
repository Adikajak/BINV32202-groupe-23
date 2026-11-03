import type { Db } from "../db/database.ts";
import type { OfferDbo, OfferStatus, PeriodCode } from "../models/offer.ts";

export interface OfferFilter {
  /** Limite aux offres de ce statut. */
  status?: OfferStatus;
  /** Limite aux offres de cette période. */
  period?: PeriodCode;
  /** Limite aux offres déposées par ce contact. */
  depositorContactId?: number;
  studentId?: number;
}

interface FindAllParams {
  status: OfferStatus | null;
  period: PeriodCode | null;
  depositorContactId: number | null;
  studentId: number | null;
}

export const createOffersRepository = (db: Db) => {
  const findAll = db.prepare<FindAllParams, OfferDbo>(`
    SELECT o.id, o.title, o.description, o.status,
           o.company_id, c.short_name AS company_short_name,
           o.depositor_contact_id,
           ay.label AS academic_year_label, p.code AS period_code,
           o.created_at, o.updated_at,
           a.id AS application_id, a.status AS application_status
    FROM offers o
    JOIN companies c ON c.id = o.company_id
    JOIN academic_years ay ON ay.id = o.academic_year_id
    JOIN periods p ON p.id = o.period_id
    LEFT JOIN applications a ON a.id = (
      SELECT a2.id
      FROM applications a2
      WHERE a2.offer_id = o.id AND a2.student_id = @studentId
      ORDER BY a2.id DESC
      LIMIT 1
    )
    WHERE (@status IS NULL OR o.status = @status)
      AND (@period IS NULL OR p.code = @period)
      AND (@depositorContactId IS NULL OR o.depositor_contact_id = @depositorContactId)
    ORDER BY ay.start_date DESC, o.created_at DESC
  `);

  return {
    /** Offres correspondant au filtre, de la plus récente année à la plus ancienne. */
    findAll: ({ status, period, depositorContactId, studentId }: OfferFilter): OfferDbo[] =>
      findAll.all({
        status: status ?? null,
        period: period ?? null,
        depositorContactId: depositorContactId ?? null,
        studentId: studentId ?? null,
      }),
  };
};

export type OffersRepository = ReturnType<typeof createOffersRepository>;

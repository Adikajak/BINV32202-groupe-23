import { toApplication, toApplicationListItem } from "../mappers/application.mapper.ts";
import type { Application, ApplicationListItem } from "../models/application.ts";
import type { User } from "../models/user.ts";
import type { ApplicationsRepository } from "../repositories/applications.repository.ts";
import type { OffersRepository } from "../repositories/offers.repository.ts";
import { HttpError } from "../utils/httpError.ts";
import { isStudent } from "./permissions.ts";

const requireStudent = (user: User): void => {
  if (!isStudent(user)) {
    throw new HttpError(403, "FORBIDDEN", "Seul un étudiant peut gérer une candidature");
  }
};

export const createApplicationsService = (
  applicationsRepository: ApplicationsRepository,
  offersRepository: OffersRepository,
) => ({
  listForStudent: (user: User): ApplicationListItem[] => {
    requireStudent(user);
    return applicationsRepository.listForStudentCurrentYear(user.id).map(toApplicationListItem);
  },

  apply: (user: User, offerId: number, message: string | null): Application => {
    requireStudent(user);
    const offer = offersRepository.findAll({}).find((candidate) => candidate.id === offerId);
    if (offer === undefined) {
      throw new HttpError(404, "NOT_FOUND", "Offre introuvable");
    }
    if (offer.status !== "PUBLISHED") {
      throw new HttpError(409, "OFFER_NOT_PUBLISHED", "L'offre n'est pas publiée");
    }

    const latest = applicationsRepository.findLatestForOfferAndStudent(offerId, user.id);
    if (latest?.status === "IN_PROGRESS") {
      throw new HttpError(409, "APPLICATION_EXISTS", "Vous avez déjà candidaté à cette offre");
    }
    const application = applicationsRepository.create(offerId, user.id, message);
    if (application === undefined) {
      throw new HttpError(409, "APPLICATION_EXISTS", "Vous avez déjà candidaté à cette offre");
    }
    return toApplication(application);
  },

  withdraw: (user: User, applicationId: number): void => {
    requireStudent(user);
    const application = applicationsRepository.findById(applicationId);
    if (application === undefined || application.student_id !== user.id) {
      throw new HttpError(404, "NOT_FOUND", "Candidature introuvable");
    }
    if (application.status !== "IN_PROGRESS") {
      throw new HttpError(409, "APPLICATION_PROCESSED", "Cette candidature a déjà été traitée");
    }
    if (applicationsRepository.withdraw(applicationId) === undefined) {
      throw new HttpError(409, "APPLICATION_PROCESSED", "Cette candidature a déjà été traitée");
    }
  },
});

export type ApplicationsService = ReturnType<typeof createApplicationsService>;

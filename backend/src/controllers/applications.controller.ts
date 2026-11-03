import { Router } from "express";
import { toApplicationDto, toApplicationListItemDto } from "../mappers/application.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import type { ApplicationsService } from "../services/applications.service.ts";
import { HttpError } from "../utils/httpError.ts";

const MAX_MESSAGE_LENGTH = 1000;

const parsePositiveInteger = (value: unknown, field: string): number => {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    throw new HttpError(400, "INVALID_BODY", `${field} doit être un entier positif`);
  }
  return value;
};

const parseApplicationBody = (body: unknown): { offerId: number; message: string | null } => {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(400, "INVALID_BODY", "Le corps doit être un objet JSON");
  }
  const record = body as Record<string, unknown>;
  const offerId = parsePositiveInteger(record.offerId, "offerId");
  if (record.message !== undefined && typeof record.message !== "string") {
    throw new HttpError(400, "INVALID_BODY", "message doit être une chaîne de caractères");
  }
  const message = typeof record.message === "string" ? record.message.trim() : "";
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new HttpError(
      400,
      "INVALID_BODY",
      `message ne peut pas dépasser ${MAX_MESSAGE_LENGTH} caractères`,
    );
  }
  return { offerId, message: message === "" ? null : message };
};

const parsePathId = (value: string): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "INVALID_QUERY", "L'identifiant doit être un entier positif");
  }
  return id;
};

export const createApplicationsRouter = (service: ApplicationsService) => {
  const router = Router();

  router.get("/", (req, res) => {
    res.json(service.listForStudent(getCurrentUser(req)).map(toApplicationListItemDto));
  });

  router.post("/", (req, res) => {
    const { offerId, message } = parseApplicationBody(req.body);
    const application = service.apply(getCurrentUser(req), offerId, message);
    res.status(201).json(toApplicationDto(application));
  });

  router.delete("/:id", (req, res) => {
    service.withdraw(getCurrentUser(req), parsePathId(req.params.id));
    res.status(204).send();
  });

  return router;
};

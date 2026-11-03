import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
import { createTestDatabase } from "./helpers/testDatabase.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";

let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  app = createTestApp();
});

describe("POST /applications", () => {
  it("crée une candidature étudiante avec un message normalisé", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.IOANA_POPESCU))
      .send({ offerId: OFFER.INTERNAL_CHATBOT, message: "  Mon message  " });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      offerId: OFFER.INTERNAL_CHATBOT,
      message: "Mon message",
      status: "IN_PROGRESS",
    });
  });

  it("accepte une candidature sans message", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.IOANA_POPESCU))
      .send({ offerId: OFFER.INTERNAL_CHATBOT });

    expect(response.status).toBe(201);
    expect(response.body.message).toBeNull();
  });

  it("refuse une offre non publiée et les doublons en cours", async () => {
    const token = tokenFor("STUDENT", STUDENT.IOANA_POPESCU);
    const unpublished = await request(app)
      .post("/applications")
      .set("Authorization", token)
      .send({ offerId: 2 });
    expect(unpublished.status).toBe(409);

    const first = await request(app)
      .post("/applications")
      .set("Authorization", token)
      .send({ offerId: OFFER.INTERNAL_CHATBOT });
    expect(first.status).toBe(201);
    const duplicate = await request(app)
      .post("/applications")
      .set("Authorization", token)
      .send({ offerId: OFFER.INTERNAL_CHATBOT });
    expect(duplicate.status).toBe(409);
  });

  it("refuse un message trop long et les contacts", async () => {
    const invalid = await request(app)
      .post("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.IOANA_POPESCU))
      .send({ offerId: OFFER.INTERNAL_CHATBOT, message: "x".repeat(1001) });
    expect(invalid.status).toBe(400);

    const forbidden = await request(app)
      .post("/applications")
      .set("Authorization", tokenFor("CONTACT", 2))
      .send({ offerId: OFFER.INTERNAL_CHATBOT });
    expect(forbidden.status).toBe(403);
  });
});

describe("DELETE /applications/:id", () => {
  it("retire une candidature en cours et permet de recandidater", async () => {
    const token = tokenFor("STUDENT", STUDENT.IOANA_POPESCU);
    const created = await request(app)
      .post("/applications")
      .set("Authorization", token)
      .send({ offerId: OFFER.INTERNAL_CHATBOT });

    const withdrawn = await request(app)
      .delete(`/applications/${created.body.id}`)
      .set("Authorization", token);
    expect(withdrawn.status).toBe(204);

    const reapplied = await request(app)
      .post("/applications")
      .set("Authorization", token)
      .send({ offerId: OFFER.INTERNAL_CHATBOT });
    expect(reapplied.status).toBe(201);
    expect(reapplied.body.id).not.toBe(created.body.id);

    const listed = await request(app).get("/applications").set("Authorization", token);
    expect(
      listed.body
        .filter((application: { offerId: number }) => application.offerId === OFFER.INTERNAL_CHATBOT)
        .map((application: { status: string }) => application.status)
        .sort(),
    ).toEqual(["IN_PROGRESS", "WITHDRAWN"]);
  });

  it("n'autorise pas le retrait d'une candidature d'un autre étudiant", async () => {
    const response = await request(app)
      .delete("/applications/1")
      .set("Authorization", tokenFor("STUDENT", STUDENT.IOANA_POPESCU));

    expect(response.status).toBe(404);
  });
});

describe("GET /applications", () => {
  it("liste toutes les tentatives de l'étudiant pour l'année courante", async () => {
    const response = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.INES_HADDAD));

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 2,
          offerTitle: "Application React de gestion de flotte",
          companyShortName: "Lumen Digital",
          academicYear: "2026-2027",
          status: "IN_PROGRESS",
        }),
        expect.objectContaining({
          id: 5,
          offerTitle: "API REST de facturation",
          status: "WITHDRAWN",
        }),
      ]),
    );
  });

  it("ne renvoie pas les candidatures d'une autre année", async () => {
    const db = createTestDatabase();
    db.prepare("INSERT INTO applications (offer_id, student_id) VALUES (?, ?)").run(
      OFFER.ARCHIVE_DIGITIZATION,
      STUDENT.INES_HADDAD,
    );

    const response = await request(createTestApp(db))
      .get("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.INES_HADDAD));

    expect(response.status).toBe(200);
    expect(response.body.map((application: { id: number }) => application.id)).toEqual([2, 5]);
  });

  it("expose les candidatures retenues et non retenues", async () => {
    const selected = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.MATEUSZ_KOWALSKI));
    const rejected = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.LEA_MERTENS));

    expect(selected.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ status: "SELECTED" })]),
    );
    expect(rejected.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ status: "REJECTED" })]),
    );
  });

  it("refuse l'accès aux profils autres qu'étudiant", async () => {
    const admin = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor("ADMIN", 1));
    const contact = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor("CONTACT", 2));

    expect(admin.status).toBe(403);
    expect(contact.status).toBe(403);
  });
});

describe("GET /offers : candidature de l'étudiant", () => {
  it("renvoie l'état de la candidature uniquement à l'étudiant", async () => {
    const student = await request(app)
      .get("/offers")
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));
    expect(student.body.find((offer: { id: number }) => offer.id === OFFER.FLEET_APP)).toMatchObject({
      application: { id: 1, status: "IN_PROGRESS" },
    });

    const admin = await request(app)
      .get("/offers")
      .set("Authorization", tokenFor("ADMIN", 1));
    expect(admin.body[0]).not.toHaveProperty("application");
  });
});

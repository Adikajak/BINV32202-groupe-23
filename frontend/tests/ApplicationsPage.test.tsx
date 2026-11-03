import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ApplicationsPage from "../src/pages/ApplicationsPage.tsx";
import { stubFetch } from "./helpers/fetchMock.ts";

const applications = [
  {
    id: 1,
    offerId: 7,
    offerTitle: "Assistant conversationnel interne",
    companyShortName: "Nexalis",
    academicYear: "2026-2027",
    period: "P2",
    message: "Mon message",
    status: "IN_PROGRESS",
    appliedAt: "2026-10-15 12:00:00",
  },
  {
    id: 2,
    offerId: 6,
    offerTitle: "Migration cloud",
    companyShortName: "Datavia",
    academicYear: "2026-2027",
    period: "P2",
    message: null,
    status: "SELECTED",
    appliedAt: "2026-09-22 12:00:00",
  },
  {
    id: 3,
    offerId: 6,
    offerTitle: "Migration cloud",
    companyShortName: "Datavia",
    academicYear: "2026-2027",
    period: "P2",
    message: null,
    status: "REJECTED",
    appliedAt: "2026-09-23 17:25:00",
  },
  {
    id: 4,
    offerId: 3,
    offerTitle: "API REST de facturation",
    companyShortName: "Orbis",
    academicYear: "2026-2027",
    period: "P2",
    message: null,
    status: "WITHDRAWN",
    appliedAt: "2026-09-30 10:30:00",
  },
];

describe("ApplicationsPage", () => {
  it("affiche toutes les tentatives et traduit les quatre statuts", async () => {
    stubFetch({ "/api/applications": () => Response.json(applications) });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Assistant conversationnel interne")).toBeInTheDocument();
    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.getByText("Retenue")).toBeInTheDocument();
    expect(screen.getByText("Non retenue")).toBeInTheDocument();
    expect(screen.getByText("Retirée")).toBeInTheDocument();
    expect(screen.getByText("Mon message")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Retirer" })).toHaveLength(1);
  });

  it("retire une candidature en cours puis actualise son statut", async () => {
    let withdrawn = false;
    stubFetch({
      "/api/applications": () => Response.json([{ ...applications[0], status: withdrawn ? "WITHDRAWN" : "IN_PROGRESS" }]),
      "/api/applications/1": () => {
        withdrawn = true;
        return new Response(null, { status: 204 });
      },
    });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);
    fireEvent.click(await screen.findByRole("button", { name: "Retirer" }));

    expect(await screen.findByText("Retirée")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("button", { name: "Retirer" })).not.toBeInTheDocument());
  });

  it("retourne à la connexion si la session a expiré", async () => {
    stubFetch({ "/api/applications": () => new Response(null, { status: 401 }) });
    const onUnauthorized = vi.fn();

    render(<ApplicationsPage token="jeton" onUnauthorized={onUnauthorized} />);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
  });
});

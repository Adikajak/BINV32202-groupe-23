import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OffersPage from "../src/pages/OffersPage.tsx";
import { adminUser, contactUser, stubFetch, studentUser } from "./helpers/fetchMock.ts";

const offers = [
  {
    id: 2,
    title: "Refonte du portail client",
    companyShortName: "Lumen Digital",
    academicYear: "2026-2027",
    period: "P2",
    status: "SUBMITTED",
  },
  {
    id: 5,
    title: "Tableau de bord de qualité des données",
    companyShortName: "Lumen Data",
    academicYear: "2026-2027",
    period: "OTHER",
    status: "ASSIGNED",
  },
];

describe("OffersPage", () => {
  it("affiche les offres avec leurs libellés français", async () => {
    const fetchMock = stubFetch({ "/api/offers": () => Response.json(offers) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Refonte du portail client")).toBeInTheDocument();
    expect(screen.getByText("Soumise")).toBeInTheDocument();
    expect(screen.getByText("Attribuée")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Autre" })).toBeInTheDocument();
    expect(screen.getByText("2 offres")).toBeInTheDocument();
    expect(screen.getByText("Les offres que vous avez déposées.")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Période" })).toHaveValue("");

    fireEvent.change(screen.getByRole("combobox", { name: "Période" }), {
      target: { value: "P1" },
    });
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith("/api/offers?period=P1", expect.anything()),
    );
  });

  it("adapte la description au profil", async () => {
    stubFetch({ "/api/offers": () => Response.json([]) });

    const { unmount } = render(
      <OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />,
    );
    expect(screen.getByText("Les offres publiées.")).toBeInTheDocument();
    expect(await screen.findByText("Aucune offre à afficher.")).toBeInTheDocument();
    unmount();

    render(<OffersPage user={adminUser} token="jeton" onUnauthorized={vi.fn()} />);
    expect(screen.getByText("Toutes les offres, tous statuts confondus.")).toBeInTheDocument();
  });

  it("affiche un refus d'accès renvoyé par le backend", async () => {
    stubFetch({ "/api/offers": () => new Response(null, { status: 403 }) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("statut 403");
  });

  it("signale une session expirée", async () => {
    stubFetch({ "/api/offers": () => new Response(null, { status: 401 }) });
    const onUnauthorized = vi.fn();

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={onUnauthorized} />);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
  });

  it("permet à un étudiant de candidater avec un message facultatif", async () => {
    const fetchMock = stubFetch({
      "/api/offers": () => Response.json([{ ...offers[0], status: "PUBLISHED" }]),
      "/api/applications": () =>
        Response.json({
          id: 8,
          offerId: 2,
          message: "Mon message",
          status: "IN_PROGRESS",
          appliedAt: "2026-10-15 12:00:00",
        }),
    });

    render(<OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />);
    await screen.findByText("Refonte du portail client");
    fireEvent.click(screen.getByRole("button", { name: "Candidater" }));
    fireEvent.change(screen.getByRole("textbox", { name: /Message pour/ }), {
      target: { value: "Mon message" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/applications",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ offerId: 2, message: "Mon message" }),
        }),
      ),
    );
  });

  it("permet à un étudiant de retirer une candidature en cours", async () => {
    const fetchMock = stubFetch({
      "/api/offers": () =>
        Response.json([
          {
            ...offers[0],
            status: "PUBLISHED",
            application: { id: 8, status: "IN_PROGRESS" },
          },
        ]),
      "/api/applications/8": () => new Response(null, { status: 204 }),
    });

    render(<OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />);
    await screen.findByText("Refonte du portail client");
    fireEvent.click(screen.getByRole("button", { name: "Retirer" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/applications/8",
        expect.objectContaining({ method: "DELETE" }),
      ),
    );
  });
});

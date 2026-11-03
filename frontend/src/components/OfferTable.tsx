import { useState } from "react";
import type { Offer } from "../models/offer.ts";
import { applyToOffer, withdrawApplication } from "../services/applications.service.ts";
import { isUnauthorized } from "../utils/api.ts";
import { OFFER_STATUS_LABELS, OFFER_STATUS_TONES, PERIOD_LABELS } from "../utils/labels.ts";
import StatusBadge from "./StatusBadge.tsx";

interface OfferTableProps {
  offers: Offer[];
  isStudent: boolean;
  token: string;
  onUnauthorized: () => void;
  onChanged: () => void;
}

const OfferTable = ({ offers, isStudent, token, onUnauthorized, onChanged }: OfferTableProps) => (
  <div className="table-wrapper">
    <table className="data-table">
      <thead>
        <tr>
          <th scope="col">Titre</th>
          <th scope="col">Entreprise</th>
          <th scope="col">Année</th>
          <th scope="col">Période</th>
          <th scope="col">Statut</th>
          {isStudent && <th scope="col">Candidature</th>}
        </tr>
      </thead>
      <tbody>
        {offers.map((offer) => (
          <tr key={offer.id}>
            <td>{offer.title}</td>
            <td>{offer.companyShortName}</td>
            <td>{offer.academicYear}</td>
            <td>{PERIOD_LABELS[offer.period]}</td>
            <td>
              <StatusBadge
                label={OFFER_STATUS_LABELS[offer.status]}
                tone={OFFER_STATUS_TONES[offer.status]}
              />
            </td>
            {isStudent && (
              <td>
                <ApplicationAction
                  offer={offer}
                  token={token}
                  onUnauthorized={onUnauthorized}
                  onChanged={onChanged}
                />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

interface ApplicationActionProps {
  offer: Offer;
  token: string;
  onUnauthorized: () => void;
  onChanged: () => void;
}

const ApplicationAction = ({
  offer,
  token,
  onUnauthorized,
  onChanged,
}: ApplicationActionProps) => {
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const application = offer.application;

  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    setIsLoading(true);
    try {
      await action();
      setIsEditing(false);
      setMessage("");
      onChanged();
    } catch (reason: unknown) {
      if (isUnauthorized(reason)) {
        onUnauthorized();
      } else {
        setError(reason instanceof Error ? reason.message : "Erreur inconnue");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (application?.status === "IN_PROGRESS") {
    return (
      <div>
        <span>En cours</span>{" "}
        <button
          className="button button-link"
          type="button"
          disabled={isLoading}
          onClick={() => run(() => withdrawApplication(token, application.id))}
        >
          Retirer
        </button>
        {error && <span role="alert">{error}</span>}
      </div>
    );
  }

  if (application !== null && application !== undefined && application.status !== "WITHDRAWN") {
    return <StatusBadge label="Traitée" tone="info" />;
  }

  if (offer.status !== "PUBLISHED") return null;
  if (!isEditing) {
    return (
      <button className="button button-link" type="button" onClick={() => setIsEditing(true)}>
        Candidater
      </button>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void run(() => applyToOffer(token, offer.id, message));
      }}
    >
      <label>
        <span>Message (facultatif)</span>
        <textarea
          aria-label={`Message pour ${offer.title}`}
          maxLength={1000}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </label>
      <button className="button button-link" type="submit" disabled={isLoading}>
        Envoyer
      </button>
      <button className="button button-link" type="button" onClick={() => setIsEditing(false)}>
        Annuler
      </button>
      {error && <span role="alert">{error}</span>}
    </form>
  );
};

export default OfferTable;

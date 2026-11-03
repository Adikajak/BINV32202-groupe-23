import { useState } from "react";
import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import StatusBadge from "../components/StatusBadge.tsx";
import { useApplications } from "../hooks/useApplications.ts";
import type { ApplicationListItem } from "../models/application.ts";
import { withdrawApplication } from "../services/applications.service.ts";
import { isUnauthorized } from "../utils/api.ts";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
  PERIOD_LABELS,
} from "../utils/labels.ts";

interface ApplicationsPageProps {
  token: string;
  onUnauthorized: () => void;
}

const ApplicationsPage = ({ token, onUnauthorized }: ApplicationsPageProps) => {
  const { applications, isLoading, error, reload } = useApplications(token, onUnauthorized);

  const renderContent = () => {
    if (error) return <ErrorState message={error} />;
    if (isLoading) return <LoadingState />;
    if (applications.length === 0) {
      return <EmptyState message="Vous n'avez pas encore candidaté cette année." />;
    }

    return (
      <>
        <p className="result-count">
          {applications.length} candidature{applications.length > 1 ? "s" : ""}
        </p>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Offre</th>
                <th scope="col">Entreprise</th>
                <th scope="col">Année</th>
                <th scope="col">Période</th>
                <th scope="col">Statut</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <ApplicationRow
                  key={application.id}
                  application={application}
                  token={token}
                  onUnauthorized={onUnauthorized}
                  onChanged={reload}
                />
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <section>
      <h1>Mes candidatures</h1>
      <p>Vos candidatures de l'année académique en cours.</p>
      {renderContent()}
    </section>
  );
};

interface ApplicationRowProps {
  application: ApplicationListItem;
  token: string;
  onUnauthorized: () => void;
  onChanged: () => void;
}

const ApplicationRow = ({
  application,
  token,
  onUnauthorized,
  onChanged,
}: ApplicationRowProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withdraw = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await withdrawApplication(token, application.id);
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

  return (
    <tr>
      <td>
        {application.offerTitle}
        {application.message !== null && (
          <small className="application-message">{application.message}</small>
        )}
      </td>
      <td>{application.companyShortName}</td>
      <td>{application.academicYear}</td>
      <td>{PERIOD_LABELS[application.period]}</td>
      <td>
        <StatusBadge
          label={APPLICATION_STATUS_LABELS[application.status]}
          tone={APPLICATION_STATUS_TONES[application.status]}
        />
      </td>
      <td>
        {application.status === "IN_PROGRESS" && (
          <>
            <button
              className="button button-link"
              type="button"
              disabled={isLoading}
              onClick={() => void withdraw()}
            >
              Retirer
            </button>
            {error && <span role="alert">{error}</span>}
          </>
        )}
      </td>
    </tr>
  );
};

export default ApplicationsPage;

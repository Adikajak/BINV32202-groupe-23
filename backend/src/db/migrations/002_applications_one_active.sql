-- Un étudiant ne peut avoir qu'une candidature en cours pour une offre.
-- Les candidatures retirées restent historisées et autorisent une nouvelle ligne.
CREATE UNIQUE INDEX applications_one_in_progress
  ON applications (offer_id, student_id)
  WHERE status = 'IN_PROGRESS';

import React from "react";
import { apiFetch } from "../../lib/api";
import type {
  AssigneeAbsenceItem,
  AssigneeAbsenceListResponse,
  SetAssigneeAbsencePayload
} from "../../types/api";

export function useAssigneeAbsences() {
  const [absences, setAbsences] = React.useState<AssigneeAbsenceItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadAbsences = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch<AssigneeAbsenceListResponse>("/assignee-absences");
      setAbsences(response.absences);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Abwesenheiten konnten nicht geladen werden."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadAbsences();
  }, [loadAbsences]);

  const setAssigneeAbsentState = React.useCallback(
    async (payload: SetAssigneeAbsencePayload) => {
      setIsSaving(true);
      setError(null);

      try {
        const response = await apiFetch<{ absence: AssigneeAbsenceItem | null }>("/assignee-absences", {
          method: "PUT",
          body: payload
        });

        setAbsences((current) => {
          const next = current.filter(
            (entry) => entry.responsibleName !== payload.responsibleName.trim()
          );

          if (response.absence) {
            next.push(response.absence);
          }

          return next.sort((left, right) =>
            left.responsibleName.localeCompare(right.responsibleName)
          );
        });
      } catch (saveError) {
        setError(
          saveError instanceof Error
            ? saveError.message
            : "Abwesenheit konnte nicht gespeichert werden."
        );
        throw saveError;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const absentNameSet = React.useMemo(
    () =>
      new Set(
        absences.map((absence) => absence.responsibleName.trim().toLocaleLowerCase("de-DE"))
      ),
    [absences]
  );

  return {
    absences,
    absentNameSet,
    isLoading,
    isSaving,
    error,
    reloadAbsences: loadAbsences,
    setAssigneeAbsentState
  };
}

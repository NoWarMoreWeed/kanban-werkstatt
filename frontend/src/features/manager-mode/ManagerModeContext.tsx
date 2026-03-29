import React from "react";
import { apiFetch } from "../../lib/api";

type ManagerModeStatus = {
  isManagerModeActive: boolean;
  activatedAt: number | null;
  idleTimeoutMinutes: number | null;
};

type ManagerModeContextValue = {
  isManagerModeActive: boolean;
  activatedAt: number | null;
  idleTimeoutMinutes: number | null;
  isLoading: boolean;
  isModalOpen: boolean;
  submitError: string | null;
  isSubmitting: boolean;
  openModal: () => void;
  closeModal: () => void;
  activateManagerMode: (password: string) => Promise<void>;
  deactivateManagerMode: () => Promise<void>;
};

const ManagerModeContext = React.createContext<ManagerModeContextValue | null>(null);

async function loadStatus() {
  return apiFetch<ManagerModeStatus>("/manager-mode");
}

export function ManagerModeProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<ManagerModeStatus>({
    isManagerModeActive: false,
    activatedAt: null,
    idleTimeoutMinutes: null
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    let isActive = true;

    async function fetchStatus() {
      try {
        const nextStatus = await loadStatus();

        if (!isActive) {
          return;
        }

        setStatus(nextStatus);
      } catch {
        if (!isActive) {
          return;
        }

        setStatus({
          isManagerModeActive: false,
          activatedAt: null,
          idleTimeoutMinutes: null
        });
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void fetchStatus();

    return () => {
      isActive = false;
    };
  }, []);

  const value = React.useMemo<ManagerModeContextValue>(
    () => ({
      isManagerModeActive: status.isManagerModeActive,
      activatedAt: status.activatedAt,
      idleTimeoutMinutes: status.idleTimeoutMinutes,
      isLoading,
      isModalOpen,
      submitError,
      isSubmitting,
      openModal: () => {
        setSubmitError(null);
        setIsModalOpen(true);
      },
      closeModal: () => {
        if (isSubmitting) {
          return;
        }

        setSubmitError(null);
        setIsModalOpen(false);
      },
      activateManagerMode: async (password: string) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
          const nextStatus = await apiFetch<ManagerModeStatus>("/manager-mode/activate", {
            method: "POST",
            body: {
              password
            }
          });

          setStatus(nextStatus);
          setIsModalOpen(false);
        } catch (error) {
          setSubmitError(
            error instanceof Error
              ? error.message
              : "Der Verwalter Modus konnte nicht aktiviert werden."
          );
          throw error;
        } finally {
          setIsSubmitting(false);
        }
      },
      deactivateManagerMode: async () => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
          const nextStatus = await apiFetch<ManagerModeStatus>("/manager-mode/deactivate", {
            method: "POST"
          });

          setStatus(nextStatus);
          setIsModalOpen(false);
        } finally {
          setIsSubmitting(false);
        }
      }
    }),
    [isLoading, isModalOpen, isSubmitting, status, submitError]
  );

  return <ManagerModeContext.Provider value={value}>{children}</ManagerModeContext.Provider>;
}

export function useManagerMode() {
  const context = React.useContext(ManagerModeContext);

  if (!context) {
    throw new Error("useManagerMode must be used within a ManagerModeProvider.");
  }

  return context;
}

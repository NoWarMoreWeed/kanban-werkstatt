import React from "react";
import type { CardItem } from "../../types/api";
import { type CardBaseFormValues } from "./card-form.schema";
import { CardFormModal } from "./CardFormModal";

type EditCardModalProps = {
  card: CardItem | null;
  isOpen: boolean;
  isSaving: boolean;
  saveError: string | null;
  mode?: "normal" | "manager";
  onClose: () => void;
  onSubmit: (values: CardBaseFormValues) => Promise<void>;
};

const normalizePriorityValue = (value: string): CardBaseFormValues["priority"] => {
  if (value === "1" || value === "2" || value === "3" || value === "4") {
    return value;
  }

  return "2";
};

const toCardFormValues = (card: CardItem): CardBaseFormValues => ({
  responsibleName: card.responsibleName,
  deviceName: card.deviceName,
  priority: normalizePriorityValue(card.priority),
  dueDate: card.dueDate.slice(0, 10),
  partNumber: card.partNumber,
  serialNumber: card.serialNumber,
  sapNumber: card.sapNumber,
  orderNumber: card.orderNumber
});

export function EditCardModal({
  card,
  isOpen,
  isSaving,
  saveError,
  mode = "normal",
  onClose,
  onSubmit
}: EditCardModalProps) {
  if (!card) {
    return null;
  }

  return (
    <CardFormModal
      eyebrow={mode === "manager" ? "Verwalter-Korrektur" : "Karte bearbeiten"}
      title={card.deviceName}
      description={
        mode === "manager"
          ? "Diese Korrektur ist für Ausnahmefälle gedacht und kann auch außerhalb des normalen Kartenflusses genutzt werden."
          : "Bestehende Werte lassen sich hier anpassen, zum Beispiel für Korrekturen oder einen Wechsel der Zuständigkeit."
      }
      submitLabel={mode === "manager" ? "Korrektur speichern" : "Änderungen speichern"}
      initialValues={toCardFormValues(card)}
      isOpen={isOpen}
      isSaving={isSaving}
      saveError={saveError}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

import React from "react";
import { type CardBaseFormValues, cardBaseFormDefaultValues } from "./card-form.schema";
import { CardFormModal } from "./CardFormModal";

type CreateCardModalProps = {
  boardTitle: string;
  isOpen: boolean;
  isSaving: boolean;
  saveError: string | null;
  onClose: () => void;
  onSubmit: (values: CardBaseFormValues) => Promise<void>;
};

export function CreateCardModal(props: CreateCardModalProps) {
  return (
    <CardFormModal
      eyebrow="Neue Karte"
      title={props.boardTitle}
      description="Die Karte wird nach dem Speichern automatisch in der Spalte „Eingang“ angelegt."
      submitLabel="Karte anlegen"
      initialValues={cardBaseFormDefaultValues}
      isOpen={props.isOpen}
      isSaving={props.isSaving}
      saveError={props.saveError}
      onClose={props.onClose}
      onSubmit={props.onSubmit}
    />
  );
}

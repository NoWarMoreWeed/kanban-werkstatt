import React from "react";
import { apiFetch } from "../../lib/api";
import { getFieldErrorMessage, useZodForm } from "../../lib/forms";
import type {
  CardCommentsResponse,
  CardItem,
  CommentItem,
  CreateCommentPayload
} from "../../types/api";
import {
  commentFormDefaultValues,
  commentFormSchema,
  type CommentFormValues
} from "./comment-form.schema";

type CardDetailsModalProps = {
  card: CardItem | null;
  isOpen: boolean;
  onClose: () => void;
};

export function CardDetailsModal({ card, isOpen, onClose }: CardDetailsModalProps) {
  const [comments, setComments] = React.useState<CommentItem[]>([]);
  const [isLoadingComments, setIsLoadingComments] = React.useState(false);
  const [commentsError, setCommentsError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useZodForm({
    schema: commentFormSchema,
    defaultValues: commentFormDefaultValues
  });

  const loadComments = React.useCallback(async () => {
    if (!card) {
      return;
    }

    setIsLoadingComments(true);
    setCommentsError(null);

    try {
      const response = await apiFetch<CardCommentsResponse>(`/cards/${card.id}/comments`);
      setComments(response.comments);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Die Kommentare konnten nicht geladen werden.";
      setCommentsError(message);
    } finally {
      setIsLoadingComments(false);
    }
  }, [card]);

  React.useEffect(() => {
    if (!isOpen || !card) {
      setComments([]);
      setCommentsError(null);
      setSubmitError(null);
      reset(commentFormDefaultValues);
      return;
    }

    reset(commentFormDefaultValues);
    void loadComments();
  }, [card, isOpen, loadComments, reset]);

  if (!isOpen || !card) {
    return null;
  }

  const submitComment = handleSubmit(async (values: CommentFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const createdComment = await apiFetch<CommentItem>(`/cards/${card.id}/comments`, {
        method: "POST",
        body: values satisfies CreateCommentPayload
      });

      setComments((current) => [...current, createdComment]);
      reset({
        authorName: values.authorName,
        message: ""
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Der Kommentar konnte nicht gespeichert werden.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-zinc-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-zinc-500">
              Kartendetails
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-zinc-100">
              {card.deviceName}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
              Kommentare bleiben bewusst einfach und werden direkt an der Karte gespeichert.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Schließen
          </button>
        </div>

        <div className="grid gap-0 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
          <section className="border-b border-slate-200 px-6 py-6 dark:border-zinc-800 lg:border-b-0 lg:border-r">
            <dl className="grid gap-4 md:grid-cols-2">
              <DetailItem label="Zuständige Person" value={card.responsibleName} />
              <DetailItem label="Gerätebezeichnung" value={card.deviceName} />
              <DetailItem label="Priorität" value={card.priority} />
              <DetailItem label="Eckende" value={formatDate(card.dueDate)} />
              <DetailItem label="P/N" value={card.partNumber} />
              <DetailItem label="S/N" value={card.serialNumber} />
              <DetailItem label="Auftragsnummer" value={card.sapNumber} />
              <DetailItem label="Meldungsnummer" value={card.orderNumber} />
              <DetailItem label="Aktuelle Spalte" value={card.column.title} />
              <DetailItem label="Erstellt" value={formatDateTime(card.createdAt)} />
              <DetailItem label="Letzte Änderung" value={formatDateTime(card.updatedAt)} />
            </dl>
          </section>

          <section className="flex flex-col px-6 py-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-lg font-semibold text-slate-950 dark:text-zinc-100">
                  Kommentare
                </h4>
                <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
                  Chronologisch von alt nach neu.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                {comments.length}
              </span>
            </div>

            <div className="mt-5 min-h-[180px] flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-[#232323]">
              {isLoadingComments ? (
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  Kommentare werden geladen…
                </p>
              ) : commentsError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
                  {commentsError}
                </div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  Zu dieser Karte gibt es noch keine Kommentare.
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <article
                      key={comment.id}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                          {comment.authorName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-500">
                          {formatDateTime(comment.createdAt)}
                        </p>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-zinc-300">
                        {comment.message}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={submitComment} className="mt-5 space-y-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
                  Name
                </span>
                <input
                  {...register("authorName")}
                  className={inputClassName}
                  placeholder="Eigener Name"
                />
                {getFieldErrorMessage(errors.authorName) ? (
                  <span className="text-sm text-rose-700 dark:text-rose-300">
                    {getFieldErrorMessage(errors.authorName)}
                  </span>
                ) : null}
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
                  Nachricht
                </span>
                <textarea
                  {...register("message")}
                  rows={4}
                  className={`${inputClassName} resize-y`}
                  placeholder="Kurzen Kommentar eingeben"
                />
                {getFieldErrorMessage(errors.message) ? (
                  <span className="text-sm text-rose-700 dark:text-rose-300">
                    {getFieldErrorMessage(errors.message)}
                  </span>
                ) : null}
              </label>

              {submitError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
                  {submitError}
                </div>
              ) : null}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                >
                  {isSubmitting ? "Wird gespeichert…" : "Kommentar hinzufügen"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

type DetailItemProps = {
  label: string;
  value: string;
};

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-zinc-800 dark:bg-[#232323]">
      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-zinc-500">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-medium text-slate-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium"
  }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 focus:bg-white dark:border-zinc-700 dark:bg-[#212121] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-[#1b1b1b]";

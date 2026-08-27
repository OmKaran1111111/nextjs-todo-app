"use client";

import { useState } from "react";
import Link from "next/link";
import FormField from "./FormField";

export default function DynamicForm({
  variant = "panel",
  fields,
  action,
  onSubmit,
  submitLabel = "Submit",
  submitLoadingLabel,
  submitClassName,
  cancelHref,
  cancelLabel = "Cancel",
  cancelClassName,
  onCancel,
  error: externalError,
  info: externalInfo,
  footer,
  className = "",
  formClassName,
}) {
  const [internalError, setInternalError] = useState("");
  const [internalInfo, setInternalInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState(() => new Set());
  const [priorityValues, setPriorityValues] = useState(() => {
    const initial = {};
    fields.forEach((f) => {
      if (f.type === "priority") initial[f.name] = f.defaultValue;
    });
    return initial;
  });

  const error = externalError ?? internalError;
  const info = externalInfo ?? internalInfo;

  const isAuth = variant === "auth";
  const isTask = variant === "task";

  const togglePasswordVisibility = (name) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    if (!onSubmit) return;
    e.preventDefault();
    setInternalError("");
    setInternalInfo("");
    setLoading(true);
    try {
      const formData = new FormData(e.target);
      const values = {};
      fields.forEach((field) => {
        if (field.type === "custom") return;
        values[field.name] =
          field.type === "checkbox-group" ? formData.getAll(field.name) : formData.get(field.name);
      });
      const result = await onSubmit(values, formData);
      if (result?.error) {
        setInternalError(result.error);
        return;
      }
      if (result?.info) setInternalInfo(result.info);
    } catch (err) {
      setInternalError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      {error && (
        <div
          className={
            isAuth
              ? "bg-danger-soft border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] text-danger text-[13px] py-2.5 px-3.5 rounded-xl mb-4 text-center"
              : "bg-danger-soft border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] text-danger text-[0.82rem] py-[0.6rem] px-[0.85rem] rounded-[0.65rem] mb-[0.85rem]"
          }
        >
          {error}
        </div>
      )}
      {info && (
        <div className="bg-info-soft border border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] text-heading text-[13px] py-2.5 px-3.5 rounded-xl mb-4 text-center">
          {info}
        </div>
      )}

      <form
        action={onSubmit ? undefined : action}
        onSubmit={handleSubmit}
        className={formClassName || (isAuth ? "flex flex-col gap-5" : isTask ? undefined : "flex flex-col gap-[0.9rem]")}
      >
        {fields.map((field) => (
          <div key={field.name || field.label}>
            <FormField
              field={field}
              isAuth={isAuth}
              isTask={isTask}
              visiblePasswords={visiblePasswords}
              togglePasswordVisibility={togglePasswordVisibility}
              priorityValues={priorityValues}
              setPriorityValues={setPriorityValues}
            />
            {typeof field.after === "function" ? field.after() : field.after}
          </div>
        ))}

        <div className={isTask ? "mt-7 flex justify-end gap-[0.6rem]" : cancelHref || onCancel ? "flex items-center gap-[0.6rem] mt-1" : undefined}>
          {(cancelHref || onCancel) &&
            (cancelHref ? (
              <Link href={cancelHref} className={cancelClassName || (isTask ? "cursor-pointer rounded-[0.6rem] border border-[var(--color-border)] bg-transparent px-[1.1rem] py-[0.55rem] text-[0.88rem] font-semibold text-[var(--color-body)] transition-colors hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60" : "py-[0.6rem] px-4 rounded-[0.7rem] border border-border bg-transparent text-muted text-[0.85rem] font-semibold cursor-pointer no-underline text-center transition-colors duration-150 ease-out hover:bg-bg-elevated")}>
                {cancelLabel}
              </Link>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className={cancelClassName || (isTask ? "cursor-pointer rounded-[0.6rem] border border-[var(--color-border)] bg-transparent px-[1.1rem] py-[0.55rem] text-[0.88rem] font-semibold text-[var(--color-body)] transition-colors hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60" : "py-[0.6rem] px-4 rounded-[0.7rem] border border-border bg-transparent text-muted text-[0.85rem] font-semibold cursor-pointer no-underline text-center transition-colors duration-150 ease-out hover:bg-bg-elevated")}
              >
                {cancelLabel}
              </button>
            ))}
          <button
            type="submit"
            disabled={loading}
            className={
              submitClassName || (isAuth ? "w-full py-3 px-0 rounded-xl border-none text-[0.95rem] font-semibold text-[var(--color-auth-button-text)] bg-[var(--color-auth-button-bg)] cursor-pointer transition-colors duration-150 hover:bg-[var(--color-auth-button-hover)] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed" : isTask ? "cursor-pointer rounded-[0.6rem] border border-[var(--color-primary)] bg-[var(--color-primary)] px-[1.1rem] py-[0.55rem] text-[0.88rem] font-semibold text-[var(--color-primary-contrast)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60" : "py-[0.65rem] px-4 rounded-[0.7rem] border-none bg-primary text-primary-contrast text-[0.9rem] font-semibold cursor-pointer transition-colors transition-transform duration-150 ease-out hover:bg-primary-hover active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed")
            }
          >
            {loading ? submitLoadingLabel || submitLabel : submitLabel}
          </button>
        </div>
      </form>

      {footer}
    </div>
  );
}

"use client";

import { useLayoutEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import FormField from "./FormField";
import { buildGlassDisplacementMap, FLAT_DISPLACEMENT_MAP } from "@/lib/liquidGlass";

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

  const submitRef = useRef(null);
  const [submitMap, setSubmitMap] = useState(FLAT_DISPLACEMENT_MAP);
  const submitFilterId = `liquid-glass-submit-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  useLayoutEffect(() => {
    if (!isAuth) return;
    const el = submitRef.current;
    if (!el) return;

    const regenerate = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setSubmitMap(buildGlassDisplacementMap({ width, height, radius: 16, edgeBand: 10, strength: 1 }));
      }
    };

    regenerate();
    const observer = new ResizeObserver(regenerate);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isAuth]);

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
              ? "bg-danger-soft border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] text-[#fff2bf] [text-shadow:0_2px_8px_rgba(0,0,0,0.75)] text-[13px] py-2.5 px-3.5 rounded-xl mb-4 text-center"
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

      {isAuth && (
        <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
          <filter id={submitFilterId} x="-20%" y="-20%" width="140%" height="140%">
            <feImage href={submitMap} x="0" y="0" width="100%" height="100%" result="map" />
            <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" scale="30" />
          </filter>
        </svg>
      )}

      <form
        action={onSubmit ? undefined : action}
        onSubmit={handleSubmit}
        className={formClassName || (isAuth ? "flex flex-col gap-[22px]" : isTask ? undefined : "flex flex-col gap-[0.9rem]")}
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
            ref={isAuth ? submitRef : undefined}
            className={
              submitClassName || (isAuth ? "w-full py-3.5 px-0 rounded-2xl border border-[color:var(--auth-border)] text-base font-semibold text-[#fff2bf] cursor-pointer !bg-transparent appearance-none shadow-none transition-all duration-150 flex items-center justify-center gap-2.5 hover:!bg-transparent hover:text-[#fff2bf] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed" : isTask ? "cursor-pointer rounded-[0.6rem] border border-[var(--color-primary)] bg-[var(--color-primary)] px-[1.1rem] py-[0.55rem] text-[0.88rem] font-semibold text-[var(--color-primary-contrast)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60" : "py-[0.65rem] px-4 rounded-[0.7rem] border-none bg-primary text-primary-contrast text-[0.9rem] font-semibold cursor-pointer transition-colors transition-transform duration-150 ease-out hover:bg-primary-hover active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed")
            }
            style={
              isAuth
                ? {
                    position: "relative",
                    backgroundColor:
                      "color-mix(in srgb, var(--auth-button-bg) 70%, white 25%)",
                    backdropFilter: `brightness(1.12) blur(4px) url(#${submitFilterId})`,
                    WebkitBackdropFilter: "brightness(1.12) blur(2px)",
                  }
                : undefined
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
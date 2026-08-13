"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./components.module.css";

const IconMail = () => (
  <svg className={styles.fieldIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" />
    <path d="m3 6 9 7 9-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconLock = () => (
  <svg className={styles.fieldIcon} width="17" height="17" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const IconEye = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M10.6 5.2A11 11 0 0 1 12 5c7 0 11 7 11 7a13.6 13.6 0 0 1-3.2 3.9M6.5 6.6C3.9 8.3 2 11 2 11s4 7 11 7a10.4 10.4 0 0 0 4.2-.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.9 10a3 3 0 0 0 4.1 4.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FIELD_ICONS = { mail: IconMail, lock: IconLock };

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

  const isAuth = variant === "auth";
  const isTask = variant === "task";

  const renderField = (field) => {
    switch (field.type) {
      case "hidden":
        return <input key={field.name} type="hidden" name={field.name} value={field.defaultValue ?? ""} />;

      case "custom":
        return <div key={field.name || field.label}>{field.render(field)}</div>;

      case "select":
        return (
          <FieldWrap key={field.name} field={field} isAuth={isAuth} isTask={isTask}>
            <select
              name={field.name}
              defaultValue={field.defaultValue}
              required={field.required}
              className={field.className || (isTask ? "task-input" : isAuth ? styles.inputAuth : styles.selectPanel)}
            >
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FieldWrap>
        );

      case "priority": {
        const selected = priorityValues[field.name] ?? field.defaultValue;
        return (
          <div key={field.name}>
            {field.label && <label className={field.labelClassName || "field-label"}>{field.label}</label>}
            <div className={field.gridClassName || "priority-grid"}>
              {field.options.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  className={`${field.optionClassName || "priority-option"} ${
                    selected === opt.value ? field.optionActiveClassName || "priority-option-active" : ""
                  }`}
                  onClick={() => setPriorityValues((prev) => ({ ...prev, [field.name]: opt.value }))}
                >
                  {opt.emoji && <span>{opt.emoji}</span>}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
            <input type="hidden" name={field.name} value={selected ?? ""} />
          </div>
        );
      }

      case "date":
        return (
          <div key={field.name}>
            {field.label && <label className={field.labelClassName || "field-label"}>{field.label}</label>}
            <input
              type="date"
              name={field.name}
              defaultValue={field.defaultValue || ""}
              className={field.className || (isTask ? "date-input" : isAuth ? styles.inputAuth : styles.inputPanel)}
            />
          </div>
        );

      case "checkbox-group":
        return (
          <div key={field.name} className={styles.fieldLabelPanel}>
            {field.label}
            <div className={styles.permGroupList}>
              {field.groups.map((group) => (
                <fieldset key={group.id} className={styles.permGroup}>
                  <legend className={styles.permGroupLabel}>{group.label}</legend>
                  {group.options.map((opt) => (
                    <label key={opt.key} className={styles.permCheckRow}>
                      <input
                        type="checkbox"
                        name={field.name}
                        value={opt.key}
                        defaultChecked={field.checkedKeys?.includes(opt.key)}
                        className={styles.permCheckbox}
                      />
                      <span className={styles.permCheckText}>
                        <span className={styles.permCheckLabel}>{opt.label}</span>
                        {opt.description && (
                          <span className={styles.permCheckDesc}>{opt.description}</span>
                        )}
                      </span>
                    </label>
                  ))}
                </fieldset>
              ))}
            </div>
          </div>
        );

      case "password": {
        const isVisible = visiblePasswords.has(field.name);
        return (
          <FieldWrap key={field.name} field={field} isAuth={isAuth} isTask={isTask}>
            <input
              type={isVisible ? "text" : "password"}
              name={field.name}
              placeholder={field.placeholder}
              defaultValue={field.defaultValue}
              required={field.required}
              minLength={field.minLength}
              maxLength={field.maxLength}
              className={
                field.className || (isTask ? "task-input" : isAuth ? styles.inputAuth : styles.inputPanel)
              }
            />
            {isAuth && (
              <button
                type="button"
                className={styles.passwordToggleBtn}
                onClick={() => togglePasswordVisibility(field.name)}
                aria-label={isVisible ? "Hide password" : "Show password"}
              >
                {isVisible ? <IconEyeOff /> : <IconEye />}
              </button>
            )}
          </FieldWrap>
        );
      }

      default:
        return (
          <FieldWrap key={field.name} field={field} isAuth={isAuth} isTask={isTask}>
            <input
              type={field.type || "text"}
              name={field.name}
              placeholder={field.placeholder}
              defaultValue={field.defaultValue}
              required={field.required}
              pattern={field.pattern}
              title={field.title}
              minLength={field.minLength}
              maxLength={field.maxLength}
              className={
                field.className || (isTask ? "task-input" : isAuth ? styles.inputAuth : styles.inputPanel)
              }
            />
          </FieldWrap>
        );
    }
  };

  return (
    <div className={className}>
      {error && <div className={isAuth ? styles.errorAuth : styles.errorPanel}>{error}</div>}
      {info && <div className={styles.infoBanner}>{info}</div>}

      <form
        action={onSubmit ? undefined : action}
        onSubmit={handleSubmit}
        className={formClassName || (isAuth ? styles.formAuth : isTask ? undefined : styles.formPanel)}
      >
        {fields.map((field) => (
          <div key={field.name || field.label}>
            {renderField(field)}
            {typeof field.after === "function" ? field.after() : field.after}
          </div>
        ))}

        <div className={isTask ? "actions-row" : cancelHref || onCancel ? styles.actionsRow : undefined}>
          {(cancelHref || onCancel) &&
            (cancelHref ? (
              <Link href={cancelHref} className={cancelClassName || (isTask ? "cancel-btn" : styles.cancelBtnPanel)}>
                {cancelLabel}
              </Link>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className={cancelClassName || (isTask ? "cancel-btn" : styles.cancelBtnPanel)}
              >
                {cancelLabel}
              </button>
            ))}
          <button
            type="submit"
            disabled={loading}
            className={
              submitClassName || (isAuth ? styles.submitBtnAuth : isTask ? "save-btn" : styles.submitBtnPanel)
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

function FieldWrap({ field, isAuth, isTask, children }) {
  if (isTask) {
    return (
      <>
        {field.label && <label className={field.labelClassName || "field-label"}>{field.label}</label>}
        {children}
      </>
    );
  }

  if (!isAuth) {
    return (
      <label className={styles.fieldLabelPanel}>
        {field.label}
        {children}
      </label>
    );
  }

  const Icon = field.icon ? FIELD_ICONS[field.icon] : null;
  return (
    <div className={styles.inputWrapAuth}>
      {children}
      {Icon && <Icon />}
    </div>
  );
}

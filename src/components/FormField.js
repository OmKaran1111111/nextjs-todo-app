"use client";

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

function FieldWrap({ field, isAuth, isTask, children }) {
  if (isTask) {
    return (
      <>
        {field.label && <label className={field.labelClassName || "mt-5 mb-[0.6rem] block text-[0.8rem] font-semibold tracking-wide text-[var(--color-muted)] uppercase"}>{field.label}</label>}
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

export default function FormField({
  field,
  isAuth,
  isTask,
  visiblePasswords,
  togglePasswordVisibility,
  priorityValues,
  setPriorityValues,
}) {
  switch (field.type) {
    case "hidden":
      return <input type="hidden" name={field.name} value={field.defaultValue ?? ""} />;

    case "custom":
      return <div>{field.render(field)}</div>;

    case "select":
      return (
        <FieldWrap field={field} isAuth={isAuth} isTask={isTask}>
          <select
            name={field.name}
            defaultValue={field.defaultValue}
            required={field.required}
            className={field.className || (isTask ? "flex-1 rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-elevated)_50%,transparent)] px-4 py-3 text-base leading-6 text-[var(--color-heading)] outline-2 outline-transparent outline-offset-2 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-elevated)] focus:shadow-[0_0_0_4px_var(--color-info-soft)]" : isAuth ? styles.inputAuth : styles.selectPanel)}
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
        <div>
          {field.label && <label className={field.labelClassName || "mt-5 mb-[0.6rem] block text-[0.8rem] font-semibold tracking-wide text-[var(--color-muted)] uppercase"}>{field.label}</label>}
          <div className={field.gridClassName || "grid grid-cols-2 gap-[0.6rem]"}>
            {field.options.map((opt) => (
              <button
                type="button"
                key={opt.value}
                className={`${field.optionClassName || "flex cursor-pointer items-center gap-2 rounded-[0.65rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-[0.6rem] text-[0.85rem] text-[var(--color-body)] transition-all duration-150 ease-out hover:border-[var(--color-primary)]"} ${
                  selected === opt.value ? field.optionActiveClassName || "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-contrast)]" : ""
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
        <div>
          {field.label && <label className={field.labelClassName || "mt-5 mb-[0.6rem] block text-[0.8rem] font-semibold tracking-wide text-[var(--color-muted)] uppercase"}>{field.label}</label>}
          <input
            type="date"
            name={field.name}
            defaultValue={field.defaultValue || ""}
            className={field.className || (isTask ? "w-full rounded-[0.65rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-[0.6rem] text-[0.9rem] text-[var(--color-body)]" : isAuth ? styles.inputAuth : styles.inputPanel)}
          />
        </div>
      );

    case "checkbox-group":
      return (
        <div className={styles.fieldLabelPanel}>
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
        <FieldWrap field={field} isAuth={isAuth} isTask={isTask}>
          <input
            type={isVisible ? "text" : "password"}
            name={field.name}
            placeholder={field.placeholder}
            defaultValue={field.defaultValue}
            required={field.required}
            minLength={field.minLength}
            maxLength={field.maxLength}
            className={
              field.className || (isTask ? "flex-1 rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-elevated)_50%,transparent)] px-4 py-3 text-base leading-6 text-[var(--color-heading)] outline-2 outline-transparent outline-offset-2 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-elevated)] focus:shadow-[0_0_0_4px_var(--color-info-soft)]" : isAuth ? styles.inputAuth : styles.inputPanel)
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
        <FieldWrap field={field} isAuth={isAuth} isTask={isTask}>
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
              field.className || (isTask ? "flex-1 rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-elevated)_50%,transparent)] px-4 py-3 text-base leading-6 text-[var(--color-heading)] outline-2 outline-transparent outline-offset-2 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-elevated)] focus:shadow-[0_0_0_4px_var(--color-info-soft)]" : isAuth ? styles.inputAuth : styles.inputPanel)
            }
          />
        </FieldWrap>
      );
  }
}
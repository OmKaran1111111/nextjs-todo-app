"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { Icon } from "@/components/ui/Icon";
import type { FormFieldConfig, PriorityOption } from "./DynamicForm";

const inputPanelClass =
  "py-[0.6rem] px-[0.75rem] rounded-[0.65rem] border border-border bg-[color-mix(in_srgb,var(--color-bg-elevated)_50%,transparent)] text-[0.9rem] text-heading font-normal outline outline-2 outline-transparent outline-offset-2 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] focus:bg-bg-elevated focus:border-primary focus:shadow-[0_0_0_4px_var(--color-info-soft)]";
const selectPanelClass = `${inputPanelClass} cursor-pointer`;
const fieldLabelPanelClass =
  "flex flex-col gap-[0.35rem] text-[0.78rem] font-semibold text-muted";

const authInputClass =
  "w-full bg-transparent border-none outline-none text-[0.95rem] text-heading placeholder:text-faint";

type FieldIconName = "mail" | "lock";

const FIELD_ICON_NAMES: Record<FieldIconName, FieldIconName> = { mail: "mail", lock: "lock" };

interface FieldWrapProps {
  field: FormFieldConfig;
  isAuth?: boolean;
  isTask?: boolean;
  children: ReactNode;
}

function FieldWrap({ field, isAuth, isTask, children }: FieldWrapProps) {
  if (isTask) {
    return (
      <>
        {field.label && (
          <label
            className={
              field.labelClassName ||
              "mt-5 mb-[0.6rem] block text-[0.8rem] font-semibold tracking-wide text-[var(--color-muted)] uppercase"
            }
          >
            {field.label}
          </label>
        )}
        {children}
      </>
    );
  }

  if (!isAuth) {
    return (
      <label className={fieldLabelPanelClass}>
        {field.label}
        {children}
      </label>
    );
  }

  const iconName = field.icon ? FIELD_ICON_NAMES[field.icon] : null;
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border pb-2 transition-colors duration-150 focus-within:border-primary">
      {children}
      {iconName && <Icon name={iconName} size={17} className="shrink-0 ml-2.5 text-faint" />}
    </div>
  );
}

interface FormFieldProps {
  field: FormFieldConfig;
  isAuth?: boolean;
  isTask?: boolean;
  visiblePasswords: Set<string>;
  togglePasswordVisibility: (name: string) => void;
  priorityValues: Record<string, string | undefined>;
  setPriorityValues: Dispatch<SetStateAction<Record<string, string | undefined>>>;
}

export default function FormField({
  field,
  isAuth,
  isTask,
  visiblePasswords,
  togglePasswordVisibility,
  priorityValues,
  setPriorityValues,
}: FormFieldProps) {
  switch (field.type) {
    case "hidden":
      return <input type="hidden" name={field.name} value={field.defaultValue ?? ""} />;

    case "custom":
      return <div>{field.render?.(field)}</div>;

    case "select":
      return (
        <FieldWrap field={field} isAuth={isAuth} isTask={isTask}>
          <select
            name={field.name}
            defaultValue={field.defaultValue}
            required={field.required}
            className={
              field.className ||
              (isTask
                ? "flex-1 rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-elevated)_50%,transparent)] px-4 py-3 text-base leading-6 text-[var(--color-heading)] outline-2 outline-transparent outline-offset-2 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-elevated)] focus:shadow-[0_0_0_4px_var(--color-info-soft)]"
                : isAuth
                ? authInputClass
                : selectPanelClass)
            }
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FieldWrap>
      );

    case "priority": {
      const selected = priorityValues[field.name] ?? field.defaultValue;
      const options: PriorityOption[] = field.options;
      return (
        <div>
          {field.label && (
            <label
              className={
                field.labelClassName ||
                "mt-5 mb-[0.6rem] block text-[0.8rem] font-semibold tracking-wide text-[var(--color-muted)] uppercase"
              }
            >
              {field.label}
            </label>
          )}
          <div className={field.gridClassName || "grid grid-cols-2 gap-[0.6rem]"}>
            {options.map((opt) => (
              <button
                type="button"
                key={opt.value}
                className={`${
                  field.optionClassName ||
                  "flex cursor-pointer items-center gap-2 rounded-[0.65rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-[0.6rem] text-[0.85rem] text-[var(--color-body)] transition-all duration-150 ease-out hover:border-[var(--color-primary)]"
                } ${
                  selected === opt.value
                    ? field.optionActiveClassName ||
                      "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-contrast)]"
                    : ""
                }`}
                onClick={() =>
                  setPriorityValues((prev) => ({ ...prev, [field.name]: opt.value }))
                }
              >
                {opt.dotTone && <span className={`h-2 w-2 rounded-full ${opt.dotTone}`} />}
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
          {field.label && (
            <label
              className={
                field.labelClassName ||
                "mt-5 mb-[0.6rem] block text-[0.8rem] font-semibold tracking-wide text-[var(--color-muted)] uppercase"
              }
            >
              {field.label}
            </label>
          )}
          <input
            type="date"
            name={field.name}
            defaultValue={field.defaultValue || ""}
            className={
              field.className ||
              (isTask
                ? "w-full rounded-[0.65rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-[0.6rem] text-[0.9rem] text-[var(--color-body)]"
                : isAuth
                ? authInputClass
                : inputPanelClass)
            }
          />
        </div>
      );

    case "checkbox-group":
      return (
        <div className={fieldLabelPanelClass}>
          {field.label}
          <div className="flex flex-col gap-3 mt-[0.35rem]">
            {field.groups?.map((group) => (
              <fieldset key={group.id} className="border border-border rounded-xl pt-[0.65rem] px-[0.75rem] pb-2">
                <legend className="text-[0.72rem] font-bold uppercase tracking-[0.06em] text-faint px-[0.2rem]">
                  {group.label}
                </legend>
                {group.options.map((opt) => (
                  <label key={opt.key} className="flex items-start gap-2 py-[0.35rem] px-[0.2rem] cursor-pointer">
                    <input
                      type="checkbox"
                      name={field.name}
                      value={opt.key}
                      defaultChecked={field.checkedKeys?.includes(opt.key)}
                      className="mt-[0.2rem] cursor-pointer"
                    />
                    <span className="flex flex-col gap-[0.1rem]">
                      <span className="text-[0.82rem] font-semibold text-heading">{opt.label}</span>
                      {opt.description && (
                        <span className="text-[0.72rem] text-muted font-normal">{opt.description}</span>
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
              field.className ||
              (isTask
                ? "flex-1 rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-elevated)_50%,transparent)] px-4 py-3 text-base leading-6 text-[var(--color-heading)] outline-2 outline-transparent outline-offset-2 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-elevated)] focus:shadow-[0_0_0_4px_var(--color-info-soft)]"
                : isAuth
                ? authInputClass
                : inputPanelClass)
            }
          />
          {isAuth && (
            <button
              type="button"
              className="flex items-center justify-center text-faint shrink-0 ml-2.5 bg-none border-none p-0 cursor-pointer transition-colors duration-150 hover:text-heading"
              onClick={() => togglePasswordVisibility(field.name)}
              aria-label={isVisible ? "Hide password" : "Show password"}
            >
              <Icon name={isVisible ? "eyeOff" : "eye"} size={17} />
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
              field.className ||
              (isTask
                ? "flex-1 rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-elevated)_50%,transparent)] px-4 py-3 text-base leading-6 text-[var(--color-heading)] outline-2 outline-transparent outline-offset-2 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] focus:border-[var(--color-primary)] focus:bg-[var(--color-bg-elevated)] focus:shadow-[0_0_0_4px_var(--color-info-soft)]"
                : isAuth
                ? authInputClass
                : inputPanelClass)
            }
          />
        </FieldWrap>
      );
  }
}
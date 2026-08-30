"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { ActionButton } from "./Button";

type Tone = "neutral" | "warning" | "success" | "danger";

interface SubmitButtonProps extends ComponentPropsWithoutRef<"button"> {
  pendingLabel?: ReactNode;
  tone?: Tone;
}

export function SubmitButton({
  children,
  pendingLabel,
  tone = "neutral",
  className = "",
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <ActionButton
      type="submit"
      tone={tone}
      disabled={pending}
      className={`disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {pending ? pendingLabel || "…" : children}
    </ActionButton>
  );
}
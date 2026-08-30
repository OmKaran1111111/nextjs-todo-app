import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { TransitionLink } from "./TransitionLink";

type Tone = "neutral" | "warning" | "success" | "danger";

const ACTION_HOVER: Record<Tone, string> = {
  neutral: "hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-info-soft)]",
  warning: "hover:border-[var(--color-warning)] hover:text-[var(--color-warning)] hover:bg-[var(--color-warning-soft)]",
  success: "hover:border-[var(--color-success)] hover:text-[var(--color-success)] hover:bg-[var(--color-success-soft)]",
  danger: "hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]",
};

interface ActionButtonBaseProps {
  tone?: Tone;
  children?: ReactNode;
  className?: string;
  href?: string;
}

// ActionButton is polymorphic (renders a <button> or, via TransitionLink, an
// <a>) depending on whether `href` is passed. We type the rest-props against
// <button> since that's the common case, and cast to the anchor's props on
// the href branch — TransitionLink's own props are already fully typed, so
// this cast is just bridging the two DOM element shapes, not losing safety.
type ActionButtonProps = ActionButtonBaseProps & Omit<ComponentPropsWithoutRef<"button">, keyof ActionButtonBaseProps>;

export function ActionButton({ tone = "neutral", children, className = "", href, ...props }: ActionButtonProps) {
  const classes = `inline-flex cursor-pointer items-center rounded-[0.5rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-[0.65rem] py-[0.3rem] text-[0.75rem] font-semibold text-[var(--color-body)] no-underline transition-all duration-150 ease-out ${ACTION_HOVER[tone]} ${className}`;

  if (href) {
    return (
      <TransitionLink href={href} className={classes} {...(props as ComponentPropsWithoutRef<"a">)}>
        {children}
      </TransitionLink>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

interface PrimaryButtonBaseProps {
  children?: ReactNode;
  className?: string;
  href?: string;
}

type PrimaryButtonProps = PrimaryButtonBaseProps & Omit<ComponentPropsWithoutRef<"button">, keyof PrimaryButtonBaseProps>;

export function PrimaryButton({ children, className = "", href, ...props }: PrimaryButtonProps) {
  const classes = `mt-1 inline-flex cursor-pointer items-center rounded-[0.7rem] border-none bg-[var(--color-primary)] px-4 py-[0.65rem] text-[0.9rem] font-semibold text-[var(--color-primary-contrast)] no-underline transition-[background-color,transform] duration-150 ease-out hover:bg-[var(--color-primary-hover)] active:scale-[0.98] ${className}`;

  if (href) {
    return (
      <TransitionLink href={href} className={classes} {...(props as ComponentPropsWithoutRef<"a">)}>
        {children}
      </TransitionLink>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
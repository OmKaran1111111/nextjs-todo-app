"use client";

import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { runWithViewTransition } from "@/lib/viewTransition";

interface TransitionLinkProps extends ComponentPropsWithoutRef<"a"> {
  href: string;
}

export function TransitionLink({ href, children, className, ...props }: TransitionLinkProps) {
  const router = useRouter();

  return (
    <a
      href={href}
      className={className}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
          return;
        }
        e.preventDefault();
        runWithViewTransition(() => router.push(href));
      }}
      {...props}
    >
      {children}
    </a>
  );
}
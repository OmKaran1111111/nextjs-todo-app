export function runWithViewTransition(update) {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  if (
    typeof document === "undefined" ||
    typeof document.startViewTransition !== "function" ||
    prefersReduced
  ) {
    update();
    return;
  }

  document.startViewTransition(() => {
    update();
  });
}

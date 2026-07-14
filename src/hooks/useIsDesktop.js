"use client";

import { useEffect, useState } from "react";

const useIsDesktop = (breakpoint = 768) => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${breakpoint}px)`);

    const update = () => setIsDesktop(mediaQuery.matches);
    update();

    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, [breakpoint]);

  return isDesktop;
};

export default useIsDesktop;
"use client";

import { useEffect, useState } from "react";

const useIsDesktop = (breakpoint: number = 768): boolean => {
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

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
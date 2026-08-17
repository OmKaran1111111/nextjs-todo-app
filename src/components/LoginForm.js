"use client";

import { useLayoutEffect, useId, useRef, useState } from "react";
import { doSocialLogin } from "@/app/actions";
import styles from "./components.module.css";
import { buildGlassDisplacementMap, FLAT_DISPLACEMENT_MAP } from "@/lib/liquidGlass";

function useGlassFilter() {
  const ref = useRef(null);
  const [map, setMap] = useState(FLAT_DISPLACEMENT_MAP);
  const filterId = `liquid-glass-social-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const regenerate = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setMap(buildGlassDisplacementMap({ width, height, radius: 16, edgeBand: 10, strength: 1 }));
      }
    };

    regenerate();
    const observer = new ResizeObserver(regenerate);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, map, filterId };
}

const LoginForm = () => {
  const google = useGlassFilter();
  const github = useGlassFilter();

  return (
    <form action={doSocialLogin} className={styles.socialLoginForm}>
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
        <filter id={google.filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feImage href={google.map} x="0" y="0" width="100%" height="100%" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" scale="30" />
        </filter>
        <filter id={github.filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feImage href={github.map} x="0" y="0" width="100%" height="100%" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" scale="30" />
        </filter>
      </svg>

      <button
        ref={google.ref}
        className={styles.socialBtn}
        type="submit"
        name="action"
        value="google"
        style={{
          position: "relative",
          backgroundColor: "color-mix(in srgb, var(--auth-button-bg) 18%, transparent)",
          backdropFilter: `brightness(1.12) blur(2px) url(#${google.filterId})`,
          WebkitBackdropFilter: "brightness(1.12) blur(2px)",
        }}
      >
        <img
          src="/google.svg"
          alt=""
          className={styles.socialIcon}
          width={18}
          height={18}
        />
        Continue with Google
      </button>

      <button
        ref={github.ref}
        className={styles.socialBtn}
        type="submit"
        name="action"
        value="github"
        style={{
          position: "relative",
          backgroundColor: "color-mix(in srgb, var(--auth-button-bg) 18%, transparent)",
          backdropFilter: `brightness(1.12) blur(2px) url(#${github.filterId})`,
          WebkitBackdropFilter: "brightness(1.12) blur(2px)",
        }}
      >
        <img
          src="/github.svg"
          alt=""
          className={styles.socialIcon}
          width={18}
          height={18}
        />
        Continue with GitHub
      </button>
    </form>
  );
};

export default LoginForm;
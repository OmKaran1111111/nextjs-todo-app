"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { buildGlassDisplacementMap, FLAT_DISPLACEMENT_MAP } from "@/lib/liquidGlass";

interface AuthCardProps {
  filterId: string;
  watch?: unknown;
  children: ReactNode;
}


export default function AuthCard({ filterId, watch, children }: AuthCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [displacementMap, setDisplacementMap] = useState(FLAT_DISPLACEMENT_MAP);

  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const regenerate = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setDisplacementMap(
          buildGlassDisplacementMap({ width, height, radius: 28, edgeBand: 26, strength: 1 })
        );
      }
    };

    regenerate();
    const observer = new ResizeObserver(regenerate);
    observer.observe(el);
    return () => observer.disconnect();
  }, [watch]);

  const cardStyle: CSSProperties = {
    background: "color-mix(in srgb, var(--auth-card-bg) 88%, transparent)",
    filter: "drop-shadow(0 20px 46px rgba(10, 8, 4, 0.4))",
    backdropFilter: `brightness(1.12) blur(2px) url(#${filterId})`,
    WebkitBackdropFilter: "brightness(1.12) blur(2px)",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden p-6 font-sans sm:justify-start sm:pl-24">
      <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feImage href={displacementMap} x="0" y="0" width="100%" height="100%" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" scale="60" />
        </filter>
      </svg>

      <video
        className="pointer-events-none fixed top-0 left-0 h-dvh w-screen object-cover brightness-95"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/bg.mp4" type="video/mp4" />
      </video>

      <div className="pointer-events-none absolute -top-20 -left-16 h-[340px] w-[340px] rounded-full bg-[var(--auth-blob-1)] blur-[64px]" />
      <div className="pointer-events-none absolute -right-24 -bottom-28 h-[420px] w-[420px] rounded-full bg-[var(--auth-blob-2)] blur-[64px]" />

      <div
        ref={cardRef}
        style={cardStyle}
        className="relative z-10 w-full max-w-[420px] rounded-[28px] border border-[var(--auth-card-border)] px-9 pt-10 pb-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] shadow-[inset_2px_2px_0_-2px_rgba(255,250,240,0.55),inset_0_0_3px_1px_rgba(255,250,240,0.55)]"
        />
        <div className="relative z-[1]">{children}</div>
      </div>
    </div>
  );
}

export const authText = {
  headingLg: "mt-1 mb-7 text-center text-[30px] font-bold tracking-[0.025em] text-[#fbf3e4] [font-family:var(--font-display)] [text-shadow:0_2px_10px_rgba(20,15,8,0.6)]",
  headingSm: "mt-0 mb-2 text-center text-[30px] font-bold tracking-[0.025em] text-[#fbf3e4] [font-family:var(--font-display)] [text-shadow:0_2px_10px_rgba(20,15,8,0.6)]",
  info: "mb-6 text-center text-[13.5px] text-[#f3e6cf] opacity-90 [text-shadow:0_2px_10px_rgba(20,15,8,0.6)]",
  footer: "mt-5 text-center text-[13.5px] text-[#f3e6cf] [text-shadow:0_2px_10px_rgba(20,15,8,0.6)]",
  link: "cursor-pointer font-semibold text-[#e37a45] [text-shadow:0_2px_10px_rgba(20,15,8,0.6)] hover:underline",
  submitBtn:
    "w-full rounded-2xl bg-[var(--auth-button-bg)] py-3.5 text-base font-semibold tracking-[0.025em] text-[var(--auth-button-text)] transition-all duration-150 hover:bg-[var(--auth-button-hover)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
};
"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import "./page.css";
import LoginForm from "@/components/LoginForm";
import DynamicForm from "@/components/DynamicForm";
import { buildGlassDisplacementMap, FLAT_DISPLACEMENT_MAP } from "@/lib/liquidGlass";

const Page = () => {
  const router = useRouter();
  const [mode, setMode] = useState("password");
  const cardRef = useRef(null);
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
  }, [mode]);

  const handlePasswordSignIn = async ({ email, password }) => {
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      if (result.code === "banned") {
        return { error: "You can't sign in. \n Reason: you have been banned." };
      }
      return { error: "Could not sign in. Check your email and password and try again." };
    }
    router.push("/");
    router.refresh();
  };

  const handlePairingSignIn = async ({ code }) => {
    const result = await signIn("pairing-code", { code, redirect: false });
    if (result?.error) {
      return { error: "Invalid or expired code. Generate a new one from the app." };
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="auth-backdrop">
      <svg className="glass-filter-defs" aria-hidden="true">
        <filter id="liquid-glass-distortion" x="-20%" y="-20%" width="140%" height="140%">
          <feImage href={displacementMap} x="0" y="0" width="100%" height="100%" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" scale="60" />
        </filter>
      </svg>

      <video className="auth-bg-video" autoPlay muted loop playsInline>
        <source src="/videos/bg.mp4" type="video/mp4" />
      </video>
      <div className="auth-blob-1" />
      <div className="auth-blob-2" />

      <div className="auth-card" ref={cardRef}>
        <h1 className="auth-title mt-1 mb-4">Login</h1>

        <LoginForm />

        <br />

        {mode === "password" ? (
          <DynamicForm
            variant="auth"
            onSubmit={handlePasswordSignIn}
            submitLabel="Login"
            submitLoadingLabel="Logging in..."
            fields={[
              { type: "email", name: "email", placeholder: "Email", icon: "mail", required: true },
              {
                type: "password",
                name: "password",
                placeholder: "Password",
                required: true,
                after: (
                  <div className="remember-forgot-container">
                    <span />
                    <button type="button" className="forgot-btn" onClick={() => router.push("/forgot-password")}>
                      Forgot password?
                    </button>
                  </div>
                ),
              },
            ]}
          />
        ) : (
          <DynamicForm
            variant="auth"
            onSubmit={handlePairingSignIn}
            submitLabel="Log in with pairing code"
            submitLoadingLabel="Connecting..."
            fields={[
              {
                type: "text",
                name: "code",
                placeholder: "6-digit pairing code",
                icon: "lock",
                required: true,
                maxLength: 6,
              },
            ]}
          />
        )}

        <p className="auth-footer">
          <strong className="link-strong" onClick={() => setMode((prev) => (prev === "password" ? "pairing" : "password"))}>
            {mode === "password" ? "Log in with a pairing code instead" : "Log in with email and password instead"}
          </strong>
        </p>

        <p className="auth-footer">
          Don't have an account?{" "}
          <strong className="link-strong" onClick={() => router.push("/signup")}>
            Register
          </strong>
        </p>
      </div>
    </div>
  );
};

export default Page;
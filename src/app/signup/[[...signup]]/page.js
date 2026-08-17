"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import styles from "./page.module.css";
import LoginForm from "@/components/LoginForm";
import DynamicForm from "@/components/DynamicForm";
import { buildGlassDisplacementMap, FLAT_DISPLACEMENT_MAP } from "@/lib/liquidGlass";

const Page = () => {
  const router = useRouter();
  const [step, setStep] = useState("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
  }, [step]);

  const handleSignUp = async ({ email: submittedEmail, password: submittedPassword }) => {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: submittedEmail, password: submittedPassword }),
    });
    const data = await res.json();

    if (!res.ok) return { error: data.error || "Could not create account." };

    setEmail(submittedEmail);
    setPassword(submittedPassword);
    setStep("verify");
  };

  const handleVerify = async ({ code }) => {
    const res = await fetch("/api/register/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();

    if (!res.ok) return { error: data.error || "Invalid code." };

    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      router.push("/login");
      return { error: "Verified, but automatic sign-in failed. Please log in." };
    }

    router.push("/");
    router.refresh();
  };

  if (step === "verify") {
    return (
      <div className={styles.container}>
        <svg className={styles.glassFilterDefs} aria-hidden="true">
          <filter id="liquid-glass-distortion-signup" x="-20%" y="-20%" width="140%" height="140%">
            <feImage href={displacementMap} x="0" y="0" width="100%" height="100%" result="map" />
            <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" scale="60" />
          </filter>
        </svg>

        <video className={styles.bgVideo} autoPlay muted loop playsInline>
          <source src="/videos/bg.mp4" type="video/mp4" />
        </video>
        <div className={styles.blob1} />
        <div className={styles.blob2} />

        <div className={styles.card} ref={cardRef}>
          <h1 className={styles.headingRegister}>Verify your email</h1>
          <p className={styles.infoText}>We sent a 6-digit code to {email}</p>

          <DynamicForm
            variant="auth"
            onSubmit={handleVerify}
            submitLabel="Verify & Create account"
            submitLoadingLabel="Verifying..."
            fields={[{ type: "text", name: "code", placeholder: "Enter code", required: true, maxLength: 6 }]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <svg className={styles.glassFilterDefs} aria-hidden="true">
        <filter id="liquid-glass-distortion-signup" x="-20%" y="-20%" width="140%" height="140%">
          <feImage href={displacementMap} x="0" y="0" width="100%" height="100%" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" scale="60" />
        </filter>
      </svg>

      <video className={styles.bgVideo} autoPlay muted loop playsInline>
        <source src="/videos/bg.mp4" type="video/mp4" />
      </video>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.card} ref={cardRef}>
        <h1 className={styles.headingRegister}>Register</h1>

        <LoginForm />

        <br />

        <DynamicForm
          variant="auth"
          onSubmit={handleSignUp}
          submitLabel="Create account"
          submitLoadingLabel="Creating account..."
          fields={[
            { type: "email", name: "email", placeholder: "Email", icon: "mail", required: true },
            {
              type: "password",
              name: "password",
              placeholder: "Password (min 8 characters)",
              required: true,
              minLength: 8,
            },
          ]}
        />
        <p className={styles.footer}>
          Already have an account?{" "}
          <strong className={styles.linkStrong} onClick={() => (window.location.href = "/login")}>
            Login
          </strong>
        </p>
      </div>
    </div>
  );
};

export default Page;
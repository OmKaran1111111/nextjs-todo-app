"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../signup/[[...signup]]/page.module.css";
import DynamicForm from "@/components/DynamicForm";

const Page = () => {
  const router = useRouter();
  const [step, setStep] = useState("request");
  const [email, setEmail] = useState("");

  const handleRequest = async ({ email: submittedEmail }) => {
    const res = await fetch("/api/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: submittedEmail }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Something went wrong. Please try again." };

    setEmail(submittedEmail);
    setStep("reset");
  };

  const handleReset = async ({ code, newPassword }) => {
    const res = await fetch("/api/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Could not reset password." };

    setStep("done");
  };

  return (
    <div className={styles.container}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.card}>
        {step === "request" && (
          <>
            <h1 className={styles.headingForgot}>Reset your password</h1>
            <p className={styles.infoText}>Enter your email and we'll send you a reset code.</p>

            <DynamicForm
              variant="auth"
              onSubmit={handleRequest}
              submitLabel="Send reset code"
              submitLoadingLabel="Sending..."
              fields={[{ type: "email", name: "email", placeholder: "Email", required: true }]}
            />
          </>
        )}

        {step === "reset" && (
          <>
            <h1 className={styles.headingReset}>Enter your code</h1>
            <p className={styles.infoText}>We sent a 6-digit code to {email}</p>

            <DynamicForm
              variant="auth"
              onSubmit={handleReset}
              submitLabel="Reset password"
              submitLoadingLabel="Resetting..."
              fields={[
                { type: "text", name: "code", placeholder: "Enter code", required: true, maxLength: 6 },
                {
                  type: "password",
                  name: "newPassword",
                  placeholder: "New password (min 8 characters)",
                  required: true,
                  minLength: 8,
                },
              ]}
            />
          </>
        )}

        {step === "done" && (
          <>
            <h1 className={styles.headingReset}>Password updated</h1>
            <p className={styles.infoText}>You can now log in with your new password.</p>
            <button className={styles.submitBtn} type="button" onClick={() => router.push("/login")}>
              Go to login
            </button>
          </>
        )}

        {step !== "done" && (
          <p className={styles.footer}>
            Remembered your password?{" "}
            <strong className={styles.linkStrong} onClick={() => router.push("/login")}>
              Log in
            </strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default Page;

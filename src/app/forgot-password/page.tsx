"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard, { authText } from "@/components/ui/AuthCard";
import DynamicForm from "@/components/ui/forms/DynamicForm";

type AuthFieldValues = Record<string, FormDataEntryValue | FormDataEntryValue[] | null>;

type ResetStep = "request" | "reset" | "done";

const Page = () => {
  const router = useRouter();
  const [step, setStep] = useState<ResetStep>("request");
  const [email, setEmail] = useState("");

  const handleRequest = async (values: AuthFieldValues) => {
    const submittedEmail = String(values.email ?? "");

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

  const handleReset = async (values: AuthFieldValues) => {
    const code = String(values.code ?? "");
    const newPassword = String(values.newPassword ?? "");

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
    <AuthCard filterId="liquid-glass-distortion-forgot-password" watch={step}>
      {step === "request" && (
        <>
          <h1 className={authText.headingSm}>Reset your password</h1>
          <p className={authText.info}>Enter your email and we&apos;ll send you a reset code.</p>

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
          <h1 className={authText.headingSm}>Enter your code</h1>
          <p className={authText.info}>We sent a 6-digit code to {email}</p>

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
          <h1 className={authText.headingSm}>Password updated</h1>
          <p className={authText.info}>You can now log in with your new password.</p>
          <button className={authText.submitBtn} type="button" onClick={() => router.push("/login")}>
            Go to login
          </button>
        </>
      )}

      {step !== "done" && (
        <p className={authText.footer}>
          Remembered your password?{" "}
          <strong className={authText.link} onClick={() => router.push("/login")}>
            Log in
          </strong>
        </p>
      )}
    </AuthCard>
  );
};

export default Page;

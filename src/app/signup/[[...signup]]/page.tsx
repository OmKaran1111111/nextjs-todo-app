"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import AuthCard, { authText } from "@/components/ui/AuthCard";
import LoginForm from "@/components/ui/forms/LoginForm";
import DynamicForm from "@/components/ui/forms/DynamicForm";

type AuthFieldValues = Record<string, FormDataEntryValue | FormDataEntryValue[] | null>;

type SignupStep = "register" | "verify";

const Page = () => {
  const router = useRouter();
  const [step, setStep] = useState<SignupStep>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async (values: AuthFieldValues) => {
    const submittedEmail = String(values.email ?? "");
    const submittedPassword = String(values.password ?? "");

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

  const handleVerify = async (values: AuthFieldValues) => {
    const code = String(values.code ?? "");

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
      <AuthCard filterId="liquid-glass-distortion-signup" watch={step}>
        <h1 className={authText.headingLg}>Verify your email</h1>
        <p className={authText.info}>We sent a 6-digit code to {email}</p>

        <DynamicForm
          variant="auth"
          onSubmit={handleVerify}
          submitLabel="Verify & Create account"
          submitLoadingLabel="Verifying..."
          fields={[{ type: "text", name: "code", placeholder: "Enter code", required: true, maxLength: 6 }]}
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard filterId="liquid-glass-distortion-signup" watch={step}>
      <h1 className={authText.headingLg}>Register</h1>

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
      <p className={authText.footer}>
        Already have an account?{" "}
        <strong className={authText.link} onClick={() => router.push("/login")}>
          Login
        </strong>
      </p>
    </AuthCard>
  );
};

export default Page;

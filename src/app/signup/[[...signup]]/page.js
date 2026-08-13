"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import styles from "./page.module.css";
import LoginForm from "@/components/LoginForm";
import DynamicForm from "@/components/DynamicForm";

const Page = () => {
  const router = useRouter();
  const [step, setStep] = useState("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        <div className={styles.blob1} />
        <div className={styles.blob2} />

        <div className={styles.card}>
          <h1 className={styles.headingRegister}>Verify your email</h1>
          <p style={{ textAlign: "center", marginBottom: "1rem" }}>We sent a 6-digit code to {email}</p>

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
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.card}>
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

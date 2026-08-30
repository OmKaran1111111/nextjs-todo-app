"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import AuthCard, { authText } from "@/components/ui/AuthCard";
import LoginForm from "@/components/ui/forms/LoginForm";
import DynamicForm from "@/components/ui/forms/DynamicForm";

type AuthFieldValues = Record<string, FormDataEntryValue | FormDataEntryValue[] | null>;

type SignInMode = "password" | "pairing";

const Page = () => {
  const router = useRouter();
  const [mode, setMode] = useState<SignInMode>("password");

  const handlePasswordSignIn = async (values: AuthFieldValues) => {
    const email = String(values.email ?? "");
    const password = String(values.password ?? "");

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

  const handlePairingSignIn = async (values: AuthFieldValues) => {
    const code = String(values.code ?? "");

    const result = await signIn("pairing-code", { code, redirect: false });
    if (result?.error) {
      return { error: "Invalid or expired code. Generate a new one from the app." };
    }
    router.push("/");
    router.refresh();
  };

  return (
    <AuthCard filterId="liquid-glass-distortion-login" watch={mode}>
      <h1 className={authText.headingLg}>Login</h1>

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
                <div className="mt-0.5 mb-1 flex items-center justify-between text-[13.5px]">
                  <span />
                  <button
                    type="button"
                    className={authText.link}
                    onClick={() => router.push("/forgot-password")}
                  >
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

      <p className={authText.footer}>
        <strong className={authText.link} onClick={() => setMode((prev) => (prev === "password" ? "pairing" : "password"))}>
          {mode === "password" ? "Log in with a pairing code instead" : "Log in with email and password instead"}
        </strong>
      </p>

      <p className={authText.footer}>
        Don&apos;t have an account?{" "}
        <strong className={authText.link} onClick={() => router.push("/signup")}>
          Register
        </strong>
      </p>
    </AuthCard>
  );
};

export default Page;

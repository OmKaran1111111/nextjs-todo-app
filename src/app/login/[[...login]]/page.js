"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import "./page.css";
import LoginForm from "@/components/LoginForm";
import DynamicForm from "@/components/DynamicForm";

const Page = () => {
  const router = useRouter();
  const [mode, setMode] = useState("password");

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
      <div className="auth-blob-1" />
      <div className="auth-blob-2" />

      <div className="auth-card">
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

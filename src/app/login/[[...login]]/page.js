"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import "./page.css";
import LoginForm from "@/components/LoginForm";

const MailIcon = () => (
  <svg className="mail-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" />
    <path d="m3 6 9 7 9-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockIcon = () => (
  <svg className="lock-icon" width="17" height="17" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M10.6 5.2A11 11 0 0 1 12 5c7 0 11 7 11 7a13.6 13.6 0 0 1-3.2 3.9M6.5 6.6C3.9 8.3 2 11 2 11s4 7 11 7a10.4 10.4 0 0 0 4.2-.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.9 10a3 3 0 0 0 4.1 4.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const inputWrapClass = "input-wrap";
const inputClass = "input-field";
const submitClass = "submit-btn";
const errorClass = "error-box";
const footerClass = "auth-footer";
const linkStrongClass = "link-strong";

const Page = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("password");
  const [pairingCode, setPairingCode] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        if (result.code === "banned") {
          setError("You can't sign in. \n Reason: you have been banned.");
        } else {
          setError("Could not sign in. Check your email and password and try again.");
        }
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePairingSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("pairing-code", {
        code: pairingCode,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid or expired code. Generate a new one from the app.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-backdrop">
      <div className="auth-blob-1" />
      <div className="auth-blob-2" />

      <div className="auth-card">
        <h1 className="auth-title mt-1 mb-4">Login</h1>

        <LoginForm />

        <br/>

        {error && <div className={errorClass}>{error}</div>}

        {mode === "password" ? (
          <form onSubmit={handleSignIn} className="auth-form">
            <div className={inputWrapClass}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
              <MailIcon />
            </div>
            <div className={inputWrapClass}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClass}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <div className="remember-forgot-container">
              <span />
              <button
                type="button"
                className="forgot-btn"
                onClick={() => router.push("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>
            <button className={submitClass} type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePairingSignIn} className="auth-form">
            <div className={inputWrapClass}>
              <input
                type="text"
                placeholder="6-digit pairing code"
                value={pairingCode}
                onChange={(e) => setPairingCode(e.target.value)}
                required
                maxLength={6}
                className={inputClass}
              />
              <LockIcon />
            </div>
            <button className={submitClass} type="submit" disabled={loading}>
              {loading ? "Connecting..." : "Log in with pairing code"}
            </button>
          </form>
        )}

        <p className={footerClass}>
          <strong
            className={linkStrongClass}
            onClick={() => {
              setError("");
              setMode((prev) => (prev === "password" ? "pairing" : "password"));
            }}
          >
            {mode === "password" ? "Log in with a pairing code instead" : "Log in with email and password instead"}
          </strong>
        </p>

        <p className={footerClass}>
          Don't have an account?{" "}
          <strong className={linkStrongClass} onClick={() => router.push("/signup")}>
            Register
          </strong>
        </p>
      </div>
    </div>
  );
};

export default Page;
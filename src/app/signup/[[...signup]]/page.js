"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import styles from "./page.module.css";
import LoginForm from "@/components/LoginForm";

const MailIcon = () => (
  <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" />
    <path d="m3 6 9 7 9-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockIcon = () => (
  <svg className={styles.inputIcon} width="17" height="17" viewBox="0 0 24 24" fill="none">
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

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55v-1.94c-3.2.7-3.87-1.54-3.87-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.4-5.28 5.69.41.36.78 1.07.78 2.16v3.2c0 .3.21.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  </svg>
);

const Page = () => {
  const router = useRouter();
  const [step, setStep] = useState("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Could not create account.");
        return;
      }

      setStep("verify");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid code.");
        return;
      }

      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Verified, but automatic sign-in failed. Please log in.");
        router.push("/login");
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

  if (step === "verify") {
    return (
      <div className={styles.container}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />

        <div className={styles.card}>
          <h1 className={styles.headingRegister}>Verify your email</h1>
          <p style={{ textAlign: "center", marginBottom: "1rem" }}>
            We sent a 6-digit code to {email}
          </p>
          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleVerify} className={styles.form}>
            <div className={styles.inputWrap}>
              <input
                type="text"
                placeholder="Enter code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                maxLength={6}
                className={styles.input}
              />
            </div>
            <button className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Create account"}
            </button>
          </form>
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
        {error && <div className={styles.error}>{error}</div>}

        <LoginForm/>

        <br/>

        <form onSubmit={handleSignUp} className={styles.form}>
          <div className={styles.inputWrap}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.input} />
            <MailIcon />
          </div>
          <div className={styles.inputWrap}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className={styles.input}
            />
            <button
              type="button"
              className={styles.passwordToggleBtn}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
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
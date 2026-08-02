"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../signup/[[...signup]]/page.module.css";

const Page = () => {
  const router = useRouter();
  const [step, setStep] = useState("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setInfo(data.message);
      setStep("reset");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not reset password.");
        return;
      }
      setStep("done");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.card}>
        {step === "request" && (
          <>
            <h1 className={styles.headingForgot}>Reset your password</h1>
            <p className={styles.infoText}>
              Enter your email and we'll send you a reset code.
            </p>
            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleRequest} className={styles.form}>
              <div className={styles.inputWrap}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.input}
                />
              </div>
              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send reset code"}
              </button>
            </form>
          </>
        )}

        {step === "reset" && (
          <>
            <h1 className={styles.headingReset}>Enter your code</h1>
            <p className={styles.infoText}>
              {info || `We sent a 6-digit code to ${email}`}
            </p>
            {error && <div className={styles.error}>{error}</div>}

            <form onSubmit={handleReset} className={styles.form}>
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
              <div className={styles.inputWrap}>
                <input
                  type="password"
                  placeholder="New password (min 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className={styles.input}
                />
              </div>
              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>
          </>
        )}

        {step === "done" && (
          <>
            <h1 className={styles.headingReset}>Password updated</h1>
            <p className={styles.infoText}>
              You can now log in with your new password.
            </p>
            <button
              className={styles.submitBtn}
              type="button"
              onClick={() => router.push("/login")}
            >
              Go to login
            </button>
          </>
        )}

        {step !== "done" && (
          <p className={styles.footer}>
            Remembered your password?{" "}
            <strong
              className={styles.linkStrong}
              onClick={() => router.push("/login")}
            >
              Log in
            </strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default Page;

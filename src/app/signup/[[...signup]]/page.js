"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn, useSignUp } from "@clerk/nextjs/legacy";
import { useClerk } from "@clerk/nextjs";
import styles from "./page.module.css";

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

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M5 5 19 19M19 5 5 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const INITIAL_MODE = "signUp";

const Page = () => {
  const router = useRouter();
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();
  const clerk = useClerk();

  console.log("signInLoaded:", signInLoaded, "signUpLoaded:", signUpLoaded); 

  const [mode, setMode] = useState(INITIAL_MODE);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signInStrategy, setSignInStrategy] = useState(null);

  const resetFeedback = () => setError("");

  const switchMode = (next) => {
    resetFeedback();
    setMode(next);
  };

  const finishSignIn = async (sessionId) => {
    await setActiveSignIn({ session: sessionId });
    const task = clerk?.session?.currentTask;
    if (task) {
      setError(
        `You're signed in, but your account still needs to complete a setup step ("${task.key}") before continuing. Please finish that in your account settings.`
      );
      return false;
    }
    router.push("/");
    return true;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!signInLoaded) return;
    setLoading(true);
    resetFeedback();
    try {
      const result = await signIn.create({ identifier: email, password });

      if (result.status === "complete") {
        await finishSignIn(result.createdSessionId);
        return;
      }

      if (result.status === "needs_first_factor") {
        const emailFactor = result.supportedFirstFactors?.find(
          (f) => f.strategy === "email_code"
        );
        if (emailFactor) {
          await signIn.prepareFirstFactor({
            strategy: "email_code",
            emailAddressId: emailFactor.emailAddressId,
          });
          setSignInStrategy("email_code");
          setMode("verifySignInFirst");
        } else {
          console.error("Unhandled needs_first_factor factors:", result.supportedFirstFactors);
          setError("This account requires a verification method that isn't set up yet. Please contact support.");
        }
        return;
      }

      if (result.status === "needs_second_factor" || result.status === "needs_client_trust") {
        const factors = result.supportedSecondFactors || [];

        const totpFactor = factors.find((f) => f.strategy === "totp");
        const phoneFactor = factors.find((f) => f.strategy === "phone_code");
        const backupFactor = factors.find((f) => f.strategy === "backup_code");
        const emailFactor = factors.find((f) => f.strategy === "email_code");

        if (totpFactor) {
          setSignInStrategy("totp");
          setMode("verifySignInSecond");
        } else if (phoneFactor) {
          await signIn.prepareSecondFactor({
            strategy: "phone_code",
            phoneNumberId: phoneFactor.phoneNumberId,
          });
          setSignInStrategy("phone_code");
          setMode("verifySignInSecond");
        } else if (emailFactor) {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: emailFactor.emailAddressId,
          });
          setSignInStrategy("email_code");
          setMode("verifySignInSecond");
        } else if (backupFactor) {
          setSignInStrategy("backup_code");
          setMode("verifySignInSecond");
        } else {
          console.error("Unhandled second-factor strategies:", factors);
          setError("Your account's two-factor method isn't supported by this app yet. Please contact support.");
        }
        return;
      }

      if (result.status === "needs_new_password") {
        setMode("resetRequiredPassword");
        return;
      }

      console.error("Unhandled sign-in status:", result.status, result);
      setError("We couldn't complete your sign-in. Please try again or contact support.");
    } catch (err) {
      setError(err?.errors?.[0]?.message || "Could not sign in. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequiredPassword = async (e) => {
    e.preventDefault();
    if (!signInLoaded) return;
    setLoading(true);
    resetFeedback();
    try {
      const result = await signIn.resetPassword({ password: newPassword });
      if (result.status === "complete") {
        await finishSignIn(result.createdSessionId);
      } else if (result.status === "needs_second_factor") {
        setMode("verifySignInSecond");
      } else {
        console.error("Unhandled reset-password status:", result.status, result);
        setError("We couldn't set your new password. Please try again or contact support.");
      }
    } catch (err) {
      setError(err?.errors?.[0]?.message || "Could not set your new password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignInFirst = async (e) => {
    e.preventDefault();
    if (!signInLoaded) return;
    setLoading(true);
    resetFeedback();
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: signInStrategy || "email_code",
        code,
      });
      if (result.status === "complete") {
        await finishSignIn(result.createdSessionId);
      } else if (result.status === "needs_second_factor") {
        setMode("verifySignInSecond");
      } else {
        setError("That code didn't work. Please try again.");
      }
    } catch (err) {
      setError(err?.errors?.[0]?.message || "That code didn't work. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignInSecond = async (e) => {
    e.preventDefault();
    if (!signInLoaded) return;
    setLoading(true);
    resetFeedback();
    try {
      const result = await signIn.attemptSecondFactor({
        strategy: signInStrategy || "totp",
        code,
      });
      if (result.status === "complete") {
        await finishSignIn(result.createdSessionId);
      } else {
        setError("That code didn't work. Please try again.");
      }
    } catch (err) {
      setError(err?.errors?.[0]?.message || "That code didn't work. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!signUpLoaded) return;
    setLoading(true);
    resetFeedback();
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setMode("verifySignUp");
    } catch (err) {
      setError(err?.errors?.[0]?.message || "Could not create your account.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignUp = async (e) => {
    e.preventDefault();
    if (!signUpLoaded) return;
    setLoading(true);
    resetFeedback();
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActiveSignUp({ session: result.createdSessionId });
        router.push("/");
      } else {
        setError("That code didn't work. Please try again.");
      }
    } catch (err) {
      setError(err?.errors?.[0]?.message || "That code didn't work. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!signInLoaded) return;
    setLoading(true);
    resetFeedback();
    try {
      await signIn.create({ strategy: "reset_password_email_code", identifier: email });
      setMode("resetVerify");
    } catch (err) {
      setError(err?.errors?.[0]?.message || "Could not find an account with that email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!signInLoaded) return;
    setLoading(true);
    resetFeedback();
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });
      if (result.status === "complete") {
        await finishSignIn(result.createdSessionId);
      } else {
        setError("That code didn't work. Please try again.");
      }
    } catch (err) {
      setError(err?.errors?.[0]?.message || "Could not reset your password.");
    } finally {
      setLoading(false);
    }
  };

  const clearAndClose = () => {
    setEmail("");
    setPassword("");
    setNewPassword("");
    setCode("");
    setSignInStrategy(null);
    resetFeedback();
    setMode(INITIAL_MODE);
  };

  return (
    <div className={styles.container}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={styles.card}>
        <button
          className={styles.closeBtn}
          aria-label="Reset form"
          onClick={clearAndClose}
          type="button"
        >
          <CloseIcon />
        </button>

        {mode === "signIn" && (
          <>
            <h1 className={styles.headingLogin}>Login</h1>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleSignIn} className={styles.form}>
              <div className={styles.inputWrap}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.input} />
                <MailIcon />
              </div>
              <div className={styles.inputWrap}>
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={styles.input} />
                <LockIcon />
              </div>
              <div className={styles.rememberForgotWrap}>
                <label className={styles.rememberLabel}>
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className={styles.rememberCheckbox} />
                  Remember me
                </label>
                <button type="button" className={styles.forgotBtn} onClick={() => switchMode("forgot")}>
                  Forgot Password?
                </button>
              </div>
              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            <p className={styles.footer}>
              Don't have an account?{" "}
              <strong className={styles.linkStrong} onClick={() => switchMode("signUp")}>
                Register
              </strong>
            </p>
          </>
        )}

        {mode === "signUp" && (
          <>
            <button className={styles.backBtn} onClick={() => (window.location.href = "/login")} type="button">
              <BackIcon /> Back to login
            </button>
            <h1 className={styles.headingRegister}>Register</h1>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleSignUp} className={styles.form}>
              <div className={styles.inputWrap}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.input} />
                <MailIcon />
              </div>
              <div className={styles.inputWrap}>
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={styles.input} />
                <LockIcon />
              </div>
              <div id="clerk-captcha" />
              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
            <p className={styles.footer}>
              Already have an account?{" "}
              <strong className={styles.linkStrong} onClick={() => switchMode("signIn")}>
                Login
              </strong>
            </p>
          </>
        )}

        {mode === "verifySignUp" && (
          <>
            <h1 className={styles.headingVerify}>Verify email</h1>
            <p className={styles.infoText}>We sent a code to {email}</p>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleVerifySignUp} className={styles.form}>
              <div className={styles.inputWrap}>
                <input type="text" inputMode="numeric" placeholder="Verification code" value={code} onChange={(e) => setCode(e.target.value)} required className={styles.input} />
              </div>
              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify & continue"}
              </button>
            </form>
          </>
        )}

        {mode === "verifySignInFirst" && (
          <>
            <h1 className={styles.headingVerify}>Verify it's you</h1>
            <p className={styles.infoText}>
              This device hasn't signed in before. We sent a code to {email}
            </p>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleVerifySignInFirst} className={styles.form}>
              <div className={styles.inputWrap}>
                <input type="text" inputMode="numeric" placeholder="Verification code" value={code} onChange={(e) => setCode(e.target.value)} required className={styles.input} />
              </div>
              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify & continue"}
              </button>
            </form>
          </>
        )}

        {mode === "verifySignInSecond" && (
          <>
            <h1 className={styles.headingVerify}>Two-factor verification</h1>
            <p className={styles.infoText}>
              {signInStrategy === "totp"
                ? "Enter the code from your authenticator app"
                : signInStrategy === "backup_code"
                ? "Enter one of your backup codes"
                : signInStrategy === "email_code"
                ? `This device isn't recognized yet — enter the code we emailed to ${email}`
                : "We sent a code to your phone"}
            </p>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleVerifySignInSecond} className={styles.form}>
              <div className={styles.inputWrap}>
                <input
                  type="text"
                  inputMode={signInStrategy === "backup_code" ? "text" : "numeric"}
                  placeholder={signInStrategy === "backup_code" ? "Backup code" : "Verification code"}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className={styles.input}
                />
              </div>
              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify & continue"}
              </button>
            </form>
          </>
        )}

        {mode === "resetRequiredPassword" && (
          <>
            <h1 className={styles.headingVerify}>Set a new password</h1>
            <p className={styles.infoText}>
              Your account requires a new password before you can continue.
            </p>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleResetRequiredPassword} className={styles.form}>
              <div className={styles.inputWrap}>
                <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={styles.input} />
                <LockIcon />
              </div>
              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? "Setting password..." : "Set new password"}
              </button>
            </form>
          </>
        )}

        {mode === "forgot" && (
          <>
            <button className={styles.backBtn} onClick={() => switchMode("signIn")} type="button">
              <BackIcon /> Back to login
            </button>
            <h1 className={styles.headingForgot}>Reset password</h1>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleForgotRequest} className={styles.form}>
              <div className={styles.inputWrap}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.input} />
                <MailIcon />
              </div>
              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? "Sending code..." : "Send reset code"}
              </button>
            </form>
          </>
        )}

        {mode === "resetVerify" && (
          <>
            <h1 className={styles.headingReset}>New password</h1>
            <p className={styles.infoText}>
              Enter the code sent to {email} and your new password
            </p>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleResetPassword} className={styles.form}>
              <div className={styles.inputWrap}>
                <input type="text" inputMode="numeric" placeholder="Reset code" value={code} onChange={(e) => setCode(e.target.value)} required className={styles.input} />
              </div>
              <div className={styles.inputWrap}>
                <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={styles.input} />
                <LockIcon />
              </div>
              <button className={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
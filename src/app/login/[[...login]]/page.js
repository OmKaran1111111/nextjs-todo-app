"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn, useSignUp } from "@clerk/nextjs/legacy";
import { useClerk } from "@clerk/nextjs";

const MailIcon = () => (
  <svg className="text-auth-text shrink-0 ml-2.5" width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" />
    <path d="m3 6 9 7 9-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockIcon = () => (
  <svg className="text-auth-text shrink-0 ml-2.5" width="17" height="17" viewBox="0 0 24 24" fill="none">
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

const inputWrapClass =
  "flex items-center justify-between gap-2 border-b-[1.5px] border-auth-border pb-2 focus-within:border-auth-text transition-colors";
const inputClass =
  "flex-1 bg-transparent outline-none border-none text-[15px] text-auth-heading placeholder:text-auth-text/55";
const submitClass =
  "w-full py-3.5 rounded-2xl bg-auth-button-bg text-auth-button-text text-[16px] font-semibold tracking-wide hover:bg-auth-button-hover active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition";
const errorClass =
  "bg-danger-soft border border-danger/30 text-danger text-[13px] px-3.5 py-2.5 rounded-xl mb-4 text-center";
const footerClass = "text-center mt-5 text-[13.5px] text-auth-muted";
const linkStrongClass = "text-auth-button-bg font-semibold cursor-pointer hover:underline";
const backBtnClass =
  "inline-flex items-center gap-1.5 text-[13.5px] text-auth-muted hover:text-auth-heading mb-3.5";

const INITIAL_MODE = "signIn";

const Page = () => {
  const router = useRouter();
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();
  const clerk = useClerk();
  
  console.log("PK:", process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
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
    <div
      className="font-sans fixed inset-0 w-screen h-dvh flex items-center justify-center
      p-6 overflow-auto box-border [background:var(--auth-backdrop)]"
    >
      <div
        className="pointer-events-none blur-3xl absolute -top-20 -left-16 w-[340px] h-[340px]
        rounded-full bg-[var(--auth-blob-1)]"
      />
      <div
        className="pointer-events-none blur-3xl absolute -bottom-28 -right-24 w-[420px] h-[420px]
        rounded-full bg-[var(--auth-blob-2)]"
      />

      <div
        className="backdrop-blur-2xl backdrop-saturate-150 relative z-10 w-full max-w-[420px]
        box-border px-9 pt-10 pb-8 rounded-[28px] border border-[var(--auth-card-border)]
        shadow-[0_20px_60px_rgba(10,20,45,0.35)] [background:var(--auth-card-bg)]"
      >
        <button
          className="hover:scale-105 transition absolute top-[18px] right-[18px] w-[34px] h-[34px]
          rounded-[10px] bg-auth-icon-bg text-auth-icon-text flex items-center justify-center
          border-none cursor-pointer"
          aria-label="Reset form"
          onClick={clearAndClose}
          type="button"
        >
          <CloseIcon />
        </button>

        {mode === "signIn" && (
          <>
            <h1 className="text-center text-[30px] font-bold text-auth-heading tracking-wide mt-1 mb-7">Login</h1>
            {error && <div className={errorClass}>{error}</div>}
            <form onSubmit={handleSignIn} className="flex flex-col gap-[22px]">
              <div className={inputWrapClass}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
                <MailIcon />
              </div>
              <div className={inputWrapClass}>
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} />
                <LockIcon />
              </div>
              <div className="text-[13.5px] flex items-center justify-between mt-0.5 mb-1">
                <label className="flex items-center gap-2 text-auth-text cursor-pointer select-none">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-[15px] h-[15px] accent-auth-button-bg cursor-pointer" />
                  Remember me
                </label>
                <button type="button" className="font-semibold text-auth-text hover:underline" onClick={() => switchMode("forgot")}>
                  Forgot Password?
                </button>
              </div>
              <button className={submitClass} type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            <p className={footerClass}>
              Don't have an account?{" "}
              <strong className={linkStrongClass} onClick={() => (window.location.href = "/signup")}>
                Register
              </strong>
            </p>
          </>
        )}

        {mode === "signUp" && (
          <>
            <button className={backBtnClass} onClick={() => switchMode("signIn")} type="button">
              <BackIcon /> Back to login
            </button>
            <h1 className="text-center text-[30px] font-bold text-auth-heading tracking-wide mb-7">Register</h1>
            {error && <div className={errorClass}>{error}</div>}
            <form onSubmit={handleSignUp} className="flex flex-col gap-[22px]">
              <div className={inputWrapClass}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
                <MailIcon />
              </div>
              <div className={inputWrapClass}>
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} />
                <LockIcon />
              </div>
              <div id="clerk-captcha" />
              <button className={submitClass} type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
            <p className={footerClass}>
              Already have an account?{" "}
              <strong className={linkStrongClass} onClick={() => switchMode("signIn")}>
                Login
              </strong>
            </p>
          </>
        )}

        {mode === "verifySignUp" && (
          <>
            <h1 className="text-center text-[30px] font-bold text-auth-heading tracking-wide mb-2">Verify email</h1>
            <p className="text-center text-[13.5px] text-auth-muted/85 mb-6">We sent a code to {email}</p>
            {error && <div className={errorClass}>{error}</div>}
            <form onSubmit={handleVerifySignUp} className="flex flex-col gap-[22px]">
              <div className={inputWrapClass}>
                <input type="text" inputMode="numeric" placeholder="Verification code" value={code} onChange={(e) => setCode(e.target.value)} required className={inputClass} />
              </div>
              <button className={submitClass} type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify & continue"}
              </button>
            </form>
          </>
        )}

        {mode === "verifySignInFirst" && (
          <>
            <h1 className="text-center text-[30px] font-bold text-auth-heading tracking-wide mb-2">Verify it's you</h1>
            <p className="text-center text-[13.5px] text-auth-muted/85 mb-6">
              This device hasn't signed in before. We sent a code to {email}
            </p>
            {error && <div className={errorClass}>{error}</div>}
            <form onSubmit={handleVerifySignInFirst} className="flex flex-col gap-[22px]">
              <div className={inputWrapClass}>
                <input type="text" inputMode="numeric" placeholder="Verification code" value={code} onChange={(e) => setCode(e.target.value)} required className={inputClass} />
              </div>
              <button className={submitClass} type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify & continue"}
              </button>
            </form>
          </>
        )}

        {mode === "verifySignInSecond" && (
          <>
            <h1 className="text-center text-[30px] font-bold text-auth-heading tracking-wide mb-2">Two-factor verification</h1>
            <p className="text-center text-[13.5px] text-auth-muted/85 mb-6">
              {signInStrategy === "totp"
                ? "Enter the code from your authenticator app"
                : signInStrategy === "backup_code"
                ? "Enter one of your backup codes"
                : signInStrategy === "email_code"
                ? `This device isn't recognized yet — enter the code we emailed to ${email}`
                : "We sent a code to your phone"}
            </p>
            {error && <div className={errorClass}>{error}</div>}
            <form onSubmit={handleVerifySignInSecond} className="flex flex-col gap-[22px]">
              <div className={inputWrapClass}>
                <input
                  type="text"
                  inputMode={signInStrategy === "backup_code" ? "text" : "numeric"}
                  placeholder={signInStrategy === "backup_code" ? "Backup code" : "Verification code"}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <button className={submitClass} type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify & continue"}
              </button>
            </form>
          </>
        )}

        {mode === "resetRequiredPassword" && (
          <>
            <h1 className="text-center text-[30px] font-bold text-auth-heading tracking-wide mb-2">Set a new password</h1>
            <p className="text-center text-[13.5px] text-auth-muted/85 mb-6">
              Your account requires a new password before you can continue.
            </p>
            {error && <div className={errorClass}>{error}</div>}
            <form onSubmit={handleResetRequiredPassword} className="flex flex-col gap-[22px]">
              <div className={inputWrapClass}>
                <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={inputClass} />
                <LockIcon />
              </div>
              <button className={submitClass} type="submit" disabled={loading}>
                {loading ? "Setting password..." : "Set new password"}
              </button>
            </form>
          </>
        )}

        {mode === "forgot" && (
          <>
            <button className={backBtnClass} onClick={() => switchMode("signIn")} type="button">
              <BackIcon /> Back to login
            </button>
            <h1 className="text-center text-[30px] font-bold text-auth-heading tracking-wide mb-7">Reset password</h1>
            {error && <div className={errorClass}>{error}</div>}
            <form onSubmit={handleForgotRequest} className="flex flex-col gap-[22px]">
              <div className={inputWrapClass}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
                <MailIcon />
              </div>
              <button className={submitClass} type="submit" disabled={loading}>
                {loading ? "Sending code..." : "Send reset code"}
              </button>
            </form>
          </>
        )}

        {mode === "resetVerify" && (
          <>
            <h1 className="text-center text-[30px] font-bold text-auth-heading tracking-wide mb-2">New password</h1>
            <p className="text-center text-[13.5px] text-auth-muted/85 mb-6">
              Enter the code sent to {email} and your new password
            </p>
            {error && <div className={errorClass}>{error}</div>}
            <form onSubmit={handleResetPassword} className="flex flex-col gap-[22px]">
              <div className={inputWrapClass}>
                <input type="text" inputMode="numeric" placeholder="Reset code" value={code} onChange={(e) => setCode(e.target.value)} required className={inputClass} />
              </div>
              <div className={inputWrapClass}>
                <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={inputClass} />
                <LockIcon />
              </div>
              <button className={submitClass} type="submit" disabled={loading}>
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
"use client";

import { doSocialLogin } from "@/app/actions";

const socialButtonClass =
  "w-full py-3 px-0 rounded-xl border border-border text-[0.9rem] font-semibold cursor-pointer text-heading bg-bg-elevated transition-colors duration-150 flex items-center justify-center gap-2.5 hover:bg-surface-hover";

const LoginForm = () => {
  return (
    <form action={doSocialLogin} className="flex flex-col gap-3 w-full my-1 mb-2">
      <button className={socialButtonClass} type="submit" name="action" value="google">
        <img src="/google.svg" alt="" className="shrink-0 inline-block" width={18} height={18} />
        Continue with Google
      </button>

      <button className={socialButtonClass} type="submit" name="action" value="github">
        <img src="/github.svg" alt="" className="shrink-0 inline-block" width={18} height={18} />
        Continue with GitHub
      </button>
    </form>
  );
};

export default LoginForm;

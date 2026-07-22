import { doSocialLogin } from "@/app/actions";

const LoginForm = () => {
  return (
    <form action={doSocialLogin} className="social-login-form">
      <button className="social-btn" type="submit" name="action" value="google">
        <img src="/google.svg" alt="" className="social-icon" width={18} height={18} />
        Continue with Google
      </button>
      <button className="social-btn social-btn-dark" type="submit" name="action" value="github">
        <img src="/github.svg" alt="" className="social-icon" width={18} height={18} />
        Continue with GitHub
      </button>
    </form>
  );
};

export default LoginForm;
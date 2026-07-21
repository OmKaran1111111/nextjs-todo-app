import { doSocialLogin } from "@/app/actions";

const LoginForm = () => {
  return (
    <form action={doSocialLogin} className="social-login-form">
      <button className="social-btn" type="submit" name="action" value="google">
        Continue with Google
      </button>
      <button className="social-btn social-btn-dark" type="submit" name="action" value="github">
        Continue with GitHub
      </button>
    </form>
  );
};

export default LoginForm;
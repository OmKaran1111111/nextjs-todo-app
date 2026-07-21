import { doSocialLogin } from "@/app/actions";

const LoginForm = () => {
  return (
    <form action={doSocialLogin} className="flex flex-col gap-3 w-full my-4">
      <button 
        className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded transition-colors cursor-pointer block text-center"
        type="submit" 
        name="action" 
        value="google"
      >
        Sign in with Google
      </button>
      
      <button 
        className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded transition-colors cursor-pointer block text-center"
        type="submit" 
        name="action" 
        value="github"
      >
        Sign in with Github
      </button>
    </form>
  );
};

export default LoginForm;
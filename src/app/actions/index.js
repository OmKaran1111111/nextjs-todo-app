"use server"
import { signIn, signOut } from "@/auth";

export async function doSocialLogin(formData){
    const action = formData.get('action');
    await signIn(action, {redirectTo:"/"});
};
export async function doLogout(formData){
    await signOut ({ redirectTo:"/login"})
};

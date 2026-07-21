"use server"
import { signIn,signOut } from "@/auth";
import { redirect } from "next/dist/server/api-utils";

export async function doSocialLogin(formData){
    
    const action = formData.get('action');
    await signIn(action, {redirectTo:"/"})
    console.log(action);
};
export async function doLogout(formData){
    await signOut ({ redirectTo:"/login"})
};

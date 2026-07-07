import { Suspense } from "react";
import AuthLayoutWrapper from "@/components/auth/AuthLayoutWrapper";
import SignInForm from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <AuthLayoutWrapper type="signin">
      <Suspense fallback={
        <div className="flex items-center justify-center text-zinc-500 dark:text-zinc-400 font-medium">
          Loading Sign In...
        </div>
      }>
        <SignInForm />
      </Suspense>
    </AuthLayoutWrapper>
  );
}

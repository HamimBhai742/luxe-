import AuthLayoutWrapper from "@/components/auth/AuthLayoutWrapper";
import SignInForm from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <AuthLayoutWrapper type="signin">
      <SignInForm />
    </AuthLayoutWrapper>
  );
}

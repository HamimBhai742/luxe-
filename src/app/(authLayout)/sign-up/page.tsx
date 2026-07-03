import AuthLayoutWrapper from "@/components/auth/AuthLayoutWrapper";
import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <AuthLayoutWrapper type="signup">
      <SignUpForm />
    </AuthLayoutWrapper>
  );
}

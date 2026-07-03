import AuthLayoutWrapper from "@/components/auth/AuthLayoutWrapper";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthLayoutWrapper type="forgot">
      <ForgotPasswordForm />
    </AuthLayoutWrapper>
  );
}

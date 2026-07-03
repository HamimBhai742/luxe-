import AuthLayoutWrapper from "@/components/auth/AuthLayoutWrapper";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthLayoutWrapper type="reset">
      <ResetPasswordForm />
    </AuthLayoutWrapper>
  );
}

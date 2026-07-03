import AuthLayoutWrapper from "@/components/auth/AuthLayoutWrapper";
import VerifyAccountForm from "@/components/auth/VerifyAccountForm";

export default function VerifyAccountPage() {
  return (
    <AuthLayoutWrapper type="verify">
      <VerifyAccountForm />
    </AuthLayoutWrapper>
  );
}

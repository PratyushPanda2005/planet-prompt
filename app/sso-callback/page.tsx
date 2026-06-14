import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-850" />
      <AuthenticateWithRedirectCallback />
    </div>
  );
}

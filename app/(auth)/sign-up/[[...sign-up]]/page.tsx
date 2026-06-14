"use client";

import { useSignUp } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  // Form fields state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Verification & UI flow state
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-850" />
      </div>
    );
  }

  // Handle Initial Registration Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create the signup session with credentials
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      // Prepare email OTP verification
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to register. Please check details and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Code Verification Submission
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setError("Please enter the verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Verification code accepted, but session sign-in failed.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    setError("");
    try {
      signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to initiate Google sign up.");
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-neutral-800 antialiased">
      {/* Left side: Form Panel */}
      <div className="flex flex-1 flex-col justify-center px-8 py-10 lg:flex-none lg:w-[42%] bg-white h-screen overflow-y-auto">
        <div className="mx-auto w-full max-w-[340px] my-auto">
          {!pendingVerification ? (
            <>
              {/* Logo */}
              <div className="mb-6">
                <Link href="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
                  <img src="/logo.png" alt="PlanetPrompt Logo" className="h-8 w-8 object-contain" />
                  <span className="font-extrabold text-base tracking-tight text-neutral-900">
                    Planet<span className="text-[#1B3B2B] font-medium">Prompt</span>
                  </span>
                </Link>
              </div>

              {/* Header */}
              <div className="mb-6 text-left">
                <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Sign Up</h1>
                <p className="mt-1.5 text-xs text-neutral-500 font-semibold">
                  Create your account to get started.
                </p>
              </div>

              {/* Google Sign Up Button */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                className="w-full flex items-center justify-center bg-white border border-neutral-200 hover:bg-neutral-50 font-bold py-2.5 px-4 rounded-md transition-all duration-200 cursor-pointer text-xs tracking-wide uppercase text-neutral-700"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-[9px] uppercase font-bold tracking-wider">
                  <span className="bg-white px-2 text-neutral-400">or</span>
                </div>
              </div>

              {/* Input Fields */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-[11px] font-semibold text-red-600 border border-red-100 animate-fade-in">
                    {error}
                  </div>
                )}

                {/* Name Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col border border-neutral-200 rounded-md bg-neutral-50 px-3.5 py-1.5 focus-within:ring-2 focus-within:ring-[#1B3B2B] focus-within:bg-white focus-within:border-transparent transition-all duration-200">
                    <label className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Talha"
                      className="bg-transparent border-none outline-none text-neutral-900 text-sm font-semibold mt-0.5 w-full focus:ring-0 p-0 placeholder-neutral-300"
                    />
                  </div>
                  <div className="flex flex-col border border-neutral-200 rounded-md bg-neutral-50 px-3.5 py-1.5 focus-within:ring-2 focus-within:ring-[#1B3B2B] focus-within:bg-white focus-within:border-transparent transition-all duration-200">
                    <label className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Aizan"
                      className="bg-transparent border-none outline-none text-neutral-900 text-sm font-semibold mt-0.5 w-full focus:ring-0 p-0 placeholder-neutral-300"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="flex flex-col border border-neutral-200 rounded-md bg-neutral-50 px-3.5 py-1.5 focus-within:ring-2 focus-within:ring-[#1B3B2B] focus-within:bg-white focus-within:border-transparent transition-all duration-200">
                  <label className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-transparent border-none outline-none text-neutral-900 text-sm font-semibold mt-0.5 w-full focus:ring-0 p-0 placeholder-neutral-300"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col border border-neutral-200 rounded-md bg-neutral-50 px-3.5 py-1.5 focus-within:ring-2 focus-within:ring-[#1B3B2B] focus-within:bg-white focus-within:border-transparent transition-all duration-200">
                  <label className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-transparent border-none outline-none text-neutral-900 text-sm font-semibold mt-0.5 w-full focus:ring-0 p-0 placeholder-neutral-300"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#181D20] text-white hover:bg-black font-bold py-2.5 px-4 rounded-md transition-all duration-200 cursor-pointer disabled:opacity-50 mt-4 text-xs tracking-wide uppercase"
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>
              </form>

              {/* Login Link */}
              <p className="mt-6 text-left text-xs text-neutral-500 font-semibold">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-bold text-neutral-900 underline underline-offset-4 hover:text-black transition-colors"
                >
                  Login
                </Link>
              </p>
            </>
          ) : (
            /* Pending Verification Flow (OTP Verification Screen) */
            <>
              <div className="mb-6 text-left">
                <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Verify Email</h1>
                <p className="mt-1.5 text-xs text-neutral-500 font-semibold">
                  We've sent a 6-digit verification code to your email.
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-3">
                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-[11px] font-semibold text-red-600 border border-red-100 animate-fade-in">
                    {error}
                  </div>
                )}

                <div className="flex flex-col border border-neutral-200 rounded-md bg-neutral-50 px-3.5 py-1.5 focus-within:ring-2 focus-within:ring-[#1B3B2B] focus-within:bg-white focus-within:border-transparent transition-all duration-200">
                  <label className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="bg-transparent border-none outline-none text-neutral-900 text-sm font-semibold mt-0.5 w-full focus:ring-0 p-0 placeholder-neutral-300 tracking-[0.2em]"
                    maxLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#181D20] text-white hover:bg-black font-bold py-2.5 px-4 rounded-md transition-all duration-200 cursor-pointer disabled:opacity-50 mt-4 text-xs tracking-wide uppercase"
                >
                  {loading ? "Verifying..." : "Verify & Sign Up"}
                </button>

                <button
                  type="button"
                  onClick={() => setPendingVerification(false)}
                  className="w-full text-center text-xs font-bold text-neutral-500 hover:text-neutral-800 transition-colors mt-2 uppercase"
                >
                  Back to Registration
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right side: Palm Leaf Graphic Banner */}
      <div className="relative hidden lg:block lg:flex-1 lg:w-[58%] h-screen sticky top-0">
        <img
          src="/palm_leaf_bg.png"
          alt="Lush green palm leaf backlit by warm sunlight"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

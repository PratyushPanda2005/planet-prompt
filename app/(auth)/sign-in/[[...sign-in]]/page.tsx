"use client";

import { useSignIn } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-850" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        setError("Authentication verification required. Please sign in via the standard portal.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError("");
    try {
      signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to initiate Google sign in.");
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-neutral-800 antialiased">
      {/* Left side: Sign In Form */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12 lg:flex-none lg:w-[42%] bg-white">
        <div className="mx-auto w-full max-w-[340px]">
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
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Sign In</h1>
            <p className="mt-1.5 text-xs text-neutral-500 font-semibold">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-[11px] font-semibold text-red-600 border border-red-100 animate-fade-in">
                {error}
              </div>
            )}

            {/* Email Field */}
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

            {/* Password Field */}
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
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Footer Link */}
          <p className="mt-6 text-left text-xs text-neutral-500 font-semibold">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="font-bold text-neutral-900 underline underline-offset-4 hover:text-black transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Right side: Palm Leaf Graphic Banner */}
      <div className="relative hidden lg:block lg:flex-1 lg:w-[58%]">
        <img
          src="/palm_leaf_bg.png"
          alt="Lush green palm leaf backlit by bright warm sunlight"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

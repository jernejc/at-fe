"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { firebaseAuth } from "@/lib/auth/firebaseClient";
import { sendEmailLink } from "@/lib/auth/emailLink";
import Logo from "@/components/ui/Logo";
import { useState } from "react";
import { LiquidMetal } from '@paper-design/shaders-react';

type EmailState = "idle" | "sending" | "sent" | "error";

export default function SignInPage() {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailState, setEmailState] = useState<EmailState>("idle");
  const [emailError, setEmailError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const idToken = await result.user.getIdToken(true);
      const signInResult = await signIn("credentials", {
        idToken,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.replace("/");
      } else {
        setIsGoogleLoading(false);
      }
    } catch (error) {
      console.error("Sign in failed", error);
      setIsGoogleLoading(false);
    }
  };

  const handleEmailLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setEmailState("sending");
      setEmailError("");
      await sendEmailLink(email.trim());
      setEmailState("sent");
    } catch (error: any) {
      console.error("Email link sign-in failed:", error);
      setEmailState("error");
      setEmailError(error.message || "Failed to send sign-in link");
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-700 dark:text-white flex items-center justify-center p-3 sm:p-4 md:p-6">
      {/* Main Card - Full screen with margin */}
      <div className="w-full h-[calc(100vh-1.5rem)] sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] bg-white dark:bg-black rounded-2xl md:rounded-3xl shadow-2xl shadow-slate-900/10 overflow-hidden flex">
        {/* Left Content Panel */}
        <div className="w-full md:w-1/2 flex flex-col justify-around p-6 sm:p-8 md:p-12 lg:p-16 items-center">
          {/* Welcome Section - Top */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Welcome back
            </h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-slate-500 dark:text-slate-200 max-w-sm leading-relaxed">
              Sign in to your account to continue where you left off.
            </p>
          </div>

          {/* Sign In Options - Center */}
          <div className="w-full max-w-sm space-y-6">
            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="group w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-medium py-3 px-4 rounded-xl border border-slate-200 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow disabled:opacity-70 disabled:pointer-events-none"
            >
              {isGoogleLoading ? (
                <div className="h-5 w-5 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-sm text-slate-400 dark:text-slate-500">or</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Email Link Sign In */}
            {emailState === "sent" ? (
              <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="font-medium text-green-800 dark:text-green-200 mb-1">Check your email</p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  We sent a sign-in link to <strong>{email}</strong>
                </p>
                <button
                  onClick={() => {
                    setEmailState("idle");
                    setEmail("");
                  }}
                  className="mt-4 text-sm text-green-700 dark:text-green-300 hover:underline"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailLinkSignIn} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={emailState === "sending"}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-60"
                />
                {emailState === "error" && emailError && (
                  <p className="text-sm text-red-500 dark:text-red-400">{emailError}</p>
                )}
                <button
                  type="submit"
                  disabled={emailState === "sending" || !email.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {emailState === "sending" ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send sign-in link
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Logo - Bottom */}
          <div>
            <Logo orientation="horizontal" />
          </div>
        </div>

        {/* Right Accent Panel - Tablet and up */}
        <div className="hidden md:flex w-1/2 bg-[#6665FF] items-center overflow-hidden">
          <LiquidMetal
            width="100%"
            height="100%"
            image="/images/logo.svg"
            colorBack="#6665FF"
            colorTint="#ffffff"
            shape="diamond"
            repetition={2}
            softness={0.1}
            shiftRed={0.3}
            shiftBlue={0.3}
            distortion={0.07}
            contour={0.4}
            angle={70}
            speed={1}
            scale={0.6}
            fit="contain"
          />
        </div>
      </div>
    </div>
  );
}



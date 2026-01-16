"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  checkIsSignInWithEmailLink,
  completeEmailLinkSignIn,
  getStoredEmail,
} from "@/lib/auth/emailLink";
import Logo from "@/components/ui/Logo";

type Status = "checking" | "needs-email" | "signing-in" | "success" | "error";

export default function VerifyEmailLinkPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const url = window.location.href;

    // Check if this URL is a valid email sign-in link
    if (!checkIsSignInWithEmailLink(url)) {
      setStatus("error");
      setErrorMessage("Invalid or expired sign-in link.");
      return;
    }

    // Try to get email from localStorage (same device flow)
    const storedEmail = getStoredEmail();
    if (storedEmail) {
      handleSignIn(storedEmail, url);
    } else {
      // Different device - need to ask for email
      setStatus("needs-email");
    }
  }, []);

  const handleSignIn = async (emailToUse: string, url: string) => {
    try {
      setStatus("signing-in");
      
      // Complete Firebase email link sign-in
      const idToken = await completeEmailLinkSignIn(emailToUse, url);
      
      // Exchange for NextAuth session
      const result = await signIn("credentials", {
        idToken,
        redirect: false,
      });

      if (result?.ok) {
        setStatus("success");
        router.replace("/");
      } else {
        throw new Error("Failed to create session");
      }
    } catch (error: any) {
      console.error("Email link sign-in failed:", error);
      setStatus("error");
      
      // Provide user-friendly error messages
      if (error.code === "auth/invalid-action-code") {
        setErrorMessage("This sign-in link has expired or already been used.");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("The email address doesn't match the original request.");
      } else {
        setErrorMessage(error.message || "Sign-in failed. Please try again.");
      }
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      handleSignIn(email.trim(), window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-700 dark:text-white flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-md bg-white dark:bg-black rounded-2xl md:rounded-3xl shadow-2xl shadow-slate-900/10 p-8 sm:p-10">
        <div className="text-center mb-8">
          <Logo orientation="horizontal" />
        </div>

        {status === "checking" && (
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-300">Verifying sign-in link...</p>
          </div>
        )}

        {status === "needs-email" && (
          <div>
            <h1 className="text-2xl font-bold text-center mb-2">Confirm your email</h1>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-6">
              Please enter the email address you used to request the sign-in link.
            </p>
            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200"
              >
                Continue
              </button>
            </form>
          </div>
        )}

        {status === "signing-in" && (
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-300">Signing you in...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-slate-600 dark:text-slate-300">Success! Redirecting...</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Sign-in failed</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{errorMessage}</p>
            <a
              href="/signin"
              className="inline-block bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium py-3 px-6 rounded-xl transition-colors duration-200"
            >
              Back to sign in
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useVerifyEmailLink } from "./useVerifyEmailLink";

export default function VerifyEmailLinkPage() {
  const { status, email, errorMessage, setEmail, handleEmailSubmit } =
    useVerifyEmailLink();

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg border border-border p-8 sm:p-10">
        {status === "checking" && (
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-border border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying sign-in link...</p>
          </div>
        )}

        {status === "needs-email" && (
          <div>
            <h1 className="text-2xl font-bold text-center text-foreground mb-2">
              Confirm your email
            </h1>
            <p className="text-muted-foreground text-center mb-6">
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
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-4"
              />
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-xl transition-colors duration-200"
              >
                Continue
              </button>
            </form>
          </div>
        )}

        {status === "signing-in" && (
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-border border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Signing you in...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-muted-foreground">Success! Redirecting...</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Sign-in failed</h2>
            <p className="text-muted-foreground mb-6">{errorMessage}</p>
            <a
              href="/signin"
              className="inline-block bg-accent hover:bg-accent/80 text-accent-foreground font-medium py-3 px-6 rounded-xl transition-colors duration-200"
            >
              Back to sign in
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

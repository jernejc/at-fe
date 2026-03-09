"use client";

import { useState, useEffect } from "react";
import { LiquidMetal } from "@paper-design/shaders-react";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSignIn } from "./useSignIn";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function SignInPage() {
  const {
    isGoogleLoading,
    email,
    emailState,
    emailError,
    setEmail,
    handleGoogleSignIn,
    handleEmailLinkSignIn,
    resetEmailState,
  } = useSignIn();

  const { theme } = useTheme();
  const [shaderBg, setShaderBg] = useState("#FAFAFA");

  useEffect(() => {
    const isDark =
      theme === "dark" ||
      (theme === "system" && matchMedia("(prefers-color-scheme:dark)").matches);
    setShaderBg(isDark ? "#0a0a0a" : "#FAFAFA");
  }, [theme]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
      {/* Shader animation */}
      <div className="w-full max-w-md h-[280px] sm:h-80 mb-6 -mt-20 overflow-hidden bg-background">
        <LiquidMetal
          width="100%"
          height="100%"
          image="/images/logo.svg"
          colorBack={shaderBg}
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

      {/* Welcome text */}
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-center text-foreground">
        Welcome to LookAcross!
      </h1>
      <p className="mt-2 text-base text-muted-foreground text-center">
        Sign in to continue!
      </p>

      {/* Sign-in options */}
      <div className="w-full max-w-sm mt-8 space-y-5">
        {/* Google sign-in */}
        <Button
          variant="outline"
          size="xl"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full"
        >
          {isGoogleLoading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email link sign-in */}
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
            <Button
              variant="link"
              size="sm"
              onClick={resetEmailState}
              className="mt-4 text-green-700 dark:text-green-300"
            >
              Use a different email
            </Button>
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
              className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60"
            />
            {emailState === "error" && emailError && (
              <p className="text-sm text-destructive">{emailError}</p>
            )}
            <Button
              type="submit"
              variant="secondary"
              size="xl"
              disabled={emailState === "sending" || !email.trim()}
              className="w-full"
            >
              {emailState === "sending" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="size-4" />
                  Send sign-in link
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

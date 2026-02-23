"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { signIn } from "next-auth/react";
import { firebaseAuth } from "@/lib/auth/firebaseClient";
import { sendEmailLink } from "@/lib/auth/emailLink";

type EmailState = "idle" | "sending" | "sent" | "error";

interface UseSignInReturn {
  isGoogleLoading: boolean;
  email: string;
  emailState: EmailState;
  emailError: string;
  setEmail: (value: string) => void;
  handleGoogleSignIn: () => Promise<void>;
  handleEmailLinkSignIn: (e: React.FormEvent) => Promise<void>;
  resetEmailState: () => void;
}

/** Manages Google OAuth and email-link sign-in flows. */
export function useSignIn(): UseSignInReturn {
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
    } catch (error: unknown) {
      console.error("Email link sign-in failed:", error);
      setEmailState("error");
      const message = error instanceof Error ? error.message : "Failed to send sign-in link";
      setEmailError(message);
    }
  };

  const resetEmailState = () => {
    setEmailState("idle");
    setEmail("");
  };

  return {
    isGoogleLoading,
    email,
    emailState,
    emailError,
    setEmail,
    handleGoogleSignIn,
    handleEmailLinkSignIn,
    resetEmailState,
  };
}

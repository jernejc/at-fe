"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  checkIsSignInWithEmailLink,
  completeEmailLinkSignIn,
  getStoredEmail,
} from "@/lib/auth/emailLink";

type Status = "checking" | "needs-email" | "signing-in" | "success" | "error";

interface UseVerifyEmailLinkReturn {
  status: Status;
  email: string;
  errorMessage: string;
  setEmail: (value: string) => void;
  handleEmailSubmit: (e: React.FormEvent) => void;
}

/** Handles the email-link verification flow on mount and manual email entry. */
export function useVerifyEmailLink(): UseVerifyEmailLinkReturn {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = async (emailToUse: string, url: string) => {
    try {
      setStatus("signing-in");
      const idToken = await completeEmailLinkSignIn(emailToUse, url);
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
    } catch (error: unknown) {
      console.error("Email link sign-in failed:", error);
      setStatus("error");

      if (error && typeof error === "object" && "code" in error) {
        const firebaseError = error as { code: string; message?: string };
        if (firebaseError.code === "auth/invalid-action-code") {
          setErrorMessage("This sign-in link has expired or already been used.");
        } else if (firebaseError.code === "auth/invalid-email") {
          setErrorMessage("The email address doesn't match the original request.");
        } else {
          setErrorMessage(firebaseError.message || "Sign-in failed. Please try again.");
        }
      } else {
        const message = error instanceof Error ? error.message : "Sign-in failed. Please try again.";
        setErrorMessage(message);
      }
    }
  };

  useEffect(() => {
    const url = window.location.href;

    if (!checkIsSignInWithEmailLink(url)) {
      setStatus("error");
      setErrorMessage("Invalid or expired sign-in link.");
      return;
    }

    const storedEmail = getStoredEmail();
    if (storedEmail) {
      handleSignIn(storedEmail, url);
    } else {
      setStatus("needs-email");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      handleSignIn(email.trim(), window.location.href);
    }
  };

  return {
    status,
    email,
    errorMessage,
    setEmail,
    handleEmailSubmit,
  };
}

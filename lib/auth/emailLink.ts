"use client";

import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  ActionCodeSettings,
} from "firebase/auth";
import { firebaseAuth } from "./firebaseClient";

const EMAIL_STORAGE_KEY = "emailForSignIn";

/**
 * Get the action code settings for email link sign-in.
 * The URL should redirect back to the verify page.
 */
function getActionCodeSettings(): ActionCodeSettings {
  const baseUrl = typeof window !== "undefined" 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  return {
    url: `${baseUrl}/signin/verify`,
    handleCodeInApp: true,
  };
}

/**
 * Send a sign-in link to the user's email address.
 * Stores the email in localStorage for same-device completion.
 */
export async function sendEmailLink(email: string): Promise<void> {
  const actionCodeSettings = getActionCodeSettings();
  await sendSignInLinkToEmail(firebaseAuth, email, actionCodeSettings);
  
  // Save email for same-device sign-in completion
  if (typeof window !== "undefined") {
    window.localStorage.setItem(EMAIL_STORAGE_KEY, email);
  }
}

/**
 * Check if the current URL is a sign-in with email link.
 */
export function checkIsSignInWithEmailLink(url: string): boolean {
  return isSignInWithEmailLink(firebaseAuth, url);
}

/**
 * Get the stored email address from localStorage.
 */
export function getStoredEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(EMAIL_STORAGE_KEY);
}

/**
 * Clear the stored email from localStorage.
 */
export function clearStoredEmail(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(EMAIL_STORAGE_KEY);
  }
}

/**
 * Complete email link sign-in and return the Firebase ID token.
 * This token can be used with NextAuth credentials provider.
 */
export async function completeEmailLinkSignIn(
  email: string,
  url: string
): Promise<string> {
  const result = await signInWithEmailLink(firebaseAuth, email, url);
  const idToken = await result.user.getIdToken();
  
  // Clear stored email after successful sign-in
  clearStoredEmail();
  
  return idToken;
}

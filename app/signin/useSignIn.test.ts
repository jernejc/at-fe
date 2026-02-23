import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSignIn } from "./useSignIn";

const mockReplace = vi.fn();
const mockSignIn = vi.fn();
const mockSignInWithPopup = vi.fn();
const mockSendEmailLink = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));
vi.mock("next-auth/react", () => ({
  signIn: (...args: any[]) => mockSignIn(...args),
}));
vi.mock("firebase/auth", () => ({
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: (...args: any[]) => mockSignInWithPopup(...args),
}));
vi.mock("@/lib/auth/firebaseClient", () => ({
  firebaseAuth: { currentUser: null },
}));
vi.mock("@/lib/auth/emailLink", () => ({
  sendEmailLink: (...args: any[]) => mockSendEmailLink(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useSignIn", () => {
  it("initializes with idle state", () => {
    const { result } = renderHook(() => useSignIn());

    expect(result.current.isGoogleLoading).toBe(false);
    expect(result.current.email).toBe("");
    expect(result.current.emailState).toBe("idle");
    expect(result.current.emailError).toBe("");
  });

  describe("handleGoogleSignIn", () => {
    it("redirects to / on successful Google sign-in", async () => {
      const mockGetIdToken = vi.fn().mockResolvedValue("mock-id-token");
      mockSignInWithPopup.mockResolvedValue({
        user: { getIdToken: mockGetIdToken },
      });
      mockSignIn.mockResolvedValue({ ok: true });

      const { result } = renderHook(() => useSignIn());

      await act(async () => {
        await result.current.handleGoogleSignIn();
      });

      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        idToken: "mock-id-token",
        redirect: false,
      });
      expect(mockReplace).toHaveBeenCalledWith("/");
    });

    it("sets loading state during Google sign-in", async () => {
      let resolvePopup: (value: any) => void;
      mockSignInWithPopup.mockReturnValue(
        new Promise((resolve) => {
          resolvePopup = resolve;
        })
      );

      const { result } = renderHook(() => useSignIn());

      act(() => {
        result.current.handleGoogleSignIn();
      });

      expect(result.current.isGoogleLoading).toBe(true);

      await act(async () => {
        resolvePopup!({
          user: { getIdToken: vi.fn().mockResolvedValue("token") },
        });
      });
    });

    it("resets loading state when sign-in result is not ok", async () => {
      mockSignInWithPopup.mockResolvedValue({
        user: { getIdToken: vi.fn().mockResolvedValue("token") },
      });
      mockSignIn.mockResolvedValue({ ok: false });

      const { result } = renderHook(() => useSignIn());

      await act(async () => {
        await result.current.handleGoogleSignIn();
      });

      expect(result.current.isGoogleLoading).toBe(false);
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("resets loading state on Google sign-in error", async () => {
      mockSignInWithPopup.mockRejectedValue(new Error("popup closed"));

      const { result } = renderHook(() => useSignIn());

      await act(async () => {
        await result.current.handleGoogleSignIn();
      });

      expect(result.current.isGoogleLoading).toBe(false);
    });
  });

  describe("handleEmailLinkSignIn", () => {
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    it("sends email link and sets sent state on success", async () => {
      mockSendEmailLink.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSignIn());

      act(() => {
        result.current.setEmail("user@example.com");
      });

      await act(async () => {
        await result.current.handleEmailLinkSignIn(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockSendEmailLink).toHaveBeenCalledWith("user@example.com");
      expect(result.current.emailState).toBe("sent");
    });

    it("does nothing when email is empty", async () => {
      const { result } = renderHook(() => useSignIn());

      await act(async () => {
        await result.current.handleEmailLinkSignIn(mockEvent);
      });

      expect(mockSendEmailLink).not.toHaveBeenCalled();
      expect(result.current.emailState).toBe("idle");
    });

    it("sets error state on email link failure", async () => {
      mockSendEmailLink.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useSignIn());

      act(() => {
        result.current.setEmail("user@example.com");
      });

      await act(async () => {
        await result.current.handleEmailLinkSignIn(mockEvent);
      });

      expect(result.current.emailState).toBe("error");
      expect(result.current.emailError).toBe("Network error");
    });

    it("sets generic error message for non-Error throws", async () => {
      mockSendEmailLink.mockRejectedValue("string error");

      const { result } = renderHook(() => useSignIn());

      act(() => {
        result.current.setEmail("user@example.com");
      });

      await act(async () => {
        await result.current.handleEmailLinkSignIn(mockEvent);
      });

      expect(result.current.emailError).toBe("Failed to send sign-in link");
    });
  });

  describe("resetEmailState", () => {
    it("resets email state and clears email", async () => {
      mockSendEmailLink.mockResolvedValue(undefined);

      const { result } = renderHook(() => useSignIn());

      act(() => {
        result.current.setEmail("user@example.com");
      });

      await act(async () => {
        await result.current.handleEmailLinkSignIn({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      expect(result.current.emailState).toBe("sent");

      act(() => {
        result.current.resetEmailState();
      });

      expect(result.current.emailState).toBe("idle");
      expect(result.current.email).toBe("");
    });
  });
});

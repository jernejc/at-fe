import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useVerifyEmailLink } from "./useVerifyEmailLink";

const mockReplace = vi.fn();
const mockSignIn = vi.fn();
const mockCheckIsSignInWithEmailLink = vi.fn();
const mockCompleteEmailLinkSignIn = vi.fn();
const mockGetStoredEmail = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));
vi.mock("next-auth/react", () => ({
  signIn: (...args: any[]) => mockSignIn(...args),
}));
vi.mock("@/lib/auth/emailLink", () => ({
  checkIsSignInWithEmailLink: (...args: any[]) =>
    mockCheckIsSignInWithEmailLink(...args),
  completeEmailLinkSignIn: (...args: any[]) =>
    mockCompleteEmailLinkSignIn(...args),
  getStoredEmail: () => mockGetStoredEmail(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  // Default: valid link, no stored email
  mockCheckIsSignInWithEmailLink.mockReturnValue(true);
  mockGetStoredEmail.mockReturnValue(null);
});

describe("useVerifyEmailLink", () => {
  it("sets error status when URL is not a valid email sign-in link", async () => {
    mockCheckIsSignInWithEmailLink.mockReturnValue(false);

    const { result } = renderHook(() => useVerifyEmailLink());

    // useEffect runs asynchronously
    await act(async () => {});

    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe(
      "Invalid or expired sign-in link."
    );
  });

  it("prompts for email when no stored email exists", async () => {
    mockGetStoredEmail.mockReturnValue(null);

    const { result } = renderHook(() => useVerifyEmailLink());

    await act(async () => {});

    expect(result.current.status).toBe("needs-email");
  });

  it("auto-signs in when stored email is available", async () => {
    mockGetStoredEmail.mockReturnValue("user@example.com");
    mockCompleteEmailLinkSignIn.mockResolvedValue("mock-id-token");
    mockSignIn.mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useVerifyEmailLink());

    await act(async () => {});

    expect(mockCompleteEmailLinkSignIn).toHaveBeenCalledWith(
      "user@example.com",
      expect.any(String)
    );
    expect(mockSignIn).toHaveBeenCalledWith("credentials", {
      idToken: "mock-id-token",
      redirect: false,
    });
    expect(result.current.status).toBe("success");
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("sets error when NextAuth session creation fails", async () => {
    mockGetStoredEmail.mockReturnValue("user@example.com");
    mockCompleteEmailLinkSignIn.mockResolvedValue("mock-id-token");
    mockSignIn.mockResolvedValue({ ok: false });

    const { result } = renderHook(() => useVerifyEmailLink());

    await act(async () => {});

    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe("Failed to create session");
  });

  it("shows expired link message for auth/invalid-action-code error", async () => {
    mockGetStoredEmail.mockReturnValue("user@example.com");
    mockCompleteEmailLinkSignIn.mockRejectedValue({
      code: "auth/invalid-action-code",
    });

    const { result } = renderHook(() => useVerifyEmailLink());

    await act(async () => {});

    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe(
      "This sign-in link has expired or already been used."
    );
  });

  it("shows email mismatch message for auth/invalid-email error", async () => {
    mockGetStoredEmail.mockReturnValue("user@example.com");
    mockCompleteEmailLinkSignIn.mockRejectedValue({
      code: "auth/invalid-email",
    });

    const { result } = renderHook(() => useVerifyEmailLink());

    await act(async () => {});

    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe(
      "The email address doesn't match the original request."
    );
  });

  it("shows generic error message for unknown errors", async () => {
    mockGetStoredEmail.mockReturnValue("user@example.com");
    mockCompleteEmailLinkSignIn.mockRejectedValue(new Error("Unknown"));

    const { result } = renderHook(() => useVerifyEmailLink());

    await act(async () => {});

    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe("Unknown");
  });

  describe("handleEmailSubmit", () => {
    it("completes sign-in with manually entered email", async () => {
      mockCompleteEmailLinkSignIn.mockResolvedValue("mock-id-token");
      mockSignIn.mockResolvedValue({ ok: true });

      const { result } = renderHook(() => useVerifyEmailLink());

      // Wait for initial useEffect (needs-email state)
      await act(async () => {});

      // Set email
      act(() => {
        result.current.setEmail("manual@example.com");
      });

      // Submit
      await act(async () => {
        result.current.handleEmailSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      expect(mockCompleteEmailLinkSignIn).toHaveBeenCalledWith(
        "manual@example.com",
        expect.any(String)
      );
      expect(result.current.status).toBe("success");
    });

    it("does nothing when email is empty", async () => {
      const { result } = renderHook(() => useVerifyEmailLink());

      await act(async () => {});

      await act(async () => {
        result.current.handleEmailSubmit({
          preventDefault: vi.fn(),
        } as unknown as React.FormEvent);
      });

      expect(mockCompleteEmailLinkSignIn).not.toHaveBeenCalled();
    });
  });
});

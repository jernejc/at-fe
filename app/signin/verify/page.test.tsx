import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import VerifyEmailLinkPage from "./page";

const mockUseVerifyEmailLink = vi.fn();

vi.mock("./useVerifyEmailLink", () => ({
  useVerifyEmailLink: () => mockUseVerifyEmailLink(),
}));

const defaultHookValues = {
  status: "checking" as const,
  email: "",
  errorMessage: "",
  setEmail: vi.fn(),
  handleEmailSubmit: vi.fn(),
};

beforeEach(() => {
  mockUseVerifyEmailLink.mockReturnValue({ ...defaultHookValues });
});

describe("VerifyEmailLinkPage", () => {
  it("shows verifying message in checking state", () => {
    render(<VerifyEmailLinkPage />);
    expect(screen.getByText("Verifying sign-in link...")).toBeInTheDocument();
  });

  it("shows email form in needs-email state", () => {
    mockUseVerifyEmailLink.mockReturnValue({
      ...defaultHookValues,
      status: "needs-email",
    });

    render(<VerifyEmailLinkPage />);

    expect(screen.getByText("Confirm your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeInTheDocument();
  });

  it("calls handleEmailSubmit on form submission", async () => {
    const handleEmailSubmit = vi.fn((e) => e.preventDefault());
    const setEmail = vi.fn();
    mockUseVerifyEmailLink.mockReturnValue({
      ...defaultHookValues,
      status: "needs-email",
      email: "user@example.com",
      handleEmailSubmit,
      setEmail,
    });

    const user = userEvent.setup();
    render(<VerifyEmailLinkPage />);

    await user.click(screen.getByText("Continue"));
    expect(handleEmailSubmit).toHaveBeenCalled();
  });

  it("shows signing-in message", () => {
    mockUseVerifyEmailLink.mockReturnValue({
      ...defaultHookValues,
      status: "signing-in",
    });

    render(<VerifyEmailLinkPage />);
    expect(screen.getByText("Signing you in...")).toBeInTheDocument();
  });

  it("shows success message", () => {
    mockUseVerifyEmailLink.mockReturnValue({
      ...defaultHookValues,
      status: "success",
    });

    render(<VerifyEmailLinkPage />);
    expect(screen.getByText("Success! Redirecting...")).toBeInTheDocument();
  });

  it("shows error state with message and back link", () => {
    mockUseVerifyEmailLink.mockReturnValue({
      ...defaultHookValues,
      status: "error",
      errorMessage: "Link expired",
    });

    render(<VerifyEmailLinkPage />);

    expect(screen.getByText("Sign-in failed")).toBeInTheDocument();
    expect(screen.getByText("Link expired")).toBeInTheDocument();

    const backLink = screen.getByText("Back to sign in");
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest("a")).toHaveAttribute("href", "/signin");
  });
});

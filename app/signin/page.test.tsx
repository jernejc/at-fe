import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import SignInPage from "./page";

const mockUseSignIn = vi.fn();

vi.mock("./useSignIn", () => ({
  useSignIn: () => mockUseSignIn(),
}));
vi.mock("@paper-design/shaders-react", () => ({
  LiquidMetal: (props: any) => <div data-testid="liquid-metal" {...props} />,
}));

const defaultHookValues = {
  isGoogleLoading: false,
  email: "",
  emailState: "idle" as const,
  emailError: "",
  setEmail: vi.fn(),
  handleGoogleSignIn: vi.fn(),
  handleEmailLinkSignIn: vi.fn(),
  resetEmailState: vi.fn(),
};

beforeEach(() => {
  mockUseSignIn.mockReturnValue({ ...defaultHookValues });
});

describe("SignInPage", () => {
  it("renders the welcome heading and subtitle", () => {
    render(<SignInPage />);

    expect(screen.getByText("Welcome to LookAcross!")).toBeInTheDocument();
    expect(screen.getByText("Sign in to continue!")).toBeInTheDocument();
  });

  it("renders the LiquidMetal shader", () => {
    render(<SignInPage />);
    expect(screen.getByTestId("liquid-metal")).toBeInTheDocument();
  });

  it("renders the Google sign-in button", () => {
    render(<SignInPage />);
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
  });

  it("calls handleGoogleSignIn when Google button is clicked", async () => {
    const handleGoogleSignIn = vi.fn();
    mockUseSignIn.mockReturnValue({ ...defaultHookValues, handleGoogleSignIn });

    const user = userEvent.setup();
    render(<SignInPage />);

    await user.click(screen.getByText("Continue with Google"));
    expect(handleGoogleSignIn).toHaveBeenCalledOnce();
  });

  it("disables Google button when loading", () => {
    mockUseSignIn.mockReturnValue({
      ...defaultHookValues,
      isGoogleLoading: true,
    });

    render(<SignInPage />);

    const button = screen.getByRole("button", { name: "" });
    expect(button).toBeDisabled();
  });

  it("renders the or divider", () => {
    render(<SignInPage />);
    expect(screen.getByText("or")).toBeInTheDocument();
  });

  it("renders the email input and send button", () => {
    render(<SignInPage />);

    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByText("Send sign-in link")).toBeInTheDocument();
  });

  it("shows email sent confirmation when emailState is sent", () => {
    mockUseSignIn.mockReturnValue({
      ...defaultHookValues,
      emailState: "sent",
      email: "user@example.com",
    });

    render(<SignInPage />);

    expect(screen.getByText("Check your email")).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    expect(screen.getByText("Use a different email")).toBeInTheDocument();
  });

  it("calls resetEmailState when Use a different email is clicked", async () => {
    const resetEmailState = vi.fn();
    mockUseSignIn.mockReturnValue({
      ...defaultHookValues,
      emailState: "sent",
      email: "user@example.com",
      resetEmailState,
    });

    const user = userEvent.setup();
    render(<SignInPage />);

    await user.click(screen.getByText("Use a different email"));
    expect(resetEmailState).toHaveBeenCalledOnce();
  });

  it("shows error message when emailState is error", () => {
    mockUseSignIn.mockReturnValue({
      ...defaultHookValues,
      emailState: "error",
      emailError: "Something went wrong",
    });

    render(<SignInPage />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("shows sending state on email button", () => {
    mockUseSignIn.mockReturnValue({
      ...defaultHookValues,
      emailState: "sending",
      email: "user@example.com",
    });

    render(<SignInPage />);
    expect(screen.getByText("Sending...")).toBeInTheDocument();
  });
});

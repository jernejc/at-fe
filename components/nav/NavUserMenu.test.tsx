import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NavUserMenu } from "./NavUserMenu";

const mockUseSession = vi.fn();
const mockSignOut = vi.fn();
const mockFirebaseSignOut = vi.fn(() => Promise.resolve());
const mockUseTheme = vi.fn();
const mockUsePartner = vi.fn();

vi.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
  signOut: (...args: any[]) => mockSignOut(...args),
}));
vi.mock("firebase/auth", () => ({
  signOut: (...args: any[]) => mockFirebaseSignOut(...args),
}));
vi.mock("@/lib/auth/firebaseClient", () => ({
  firebaseAuth: { currentUser: null },
}));
vi.mock("@/components/providers/ThemeProvider", () => ({
  useTheme: () => mockUseTheme(),
}));
vi.mock("@/components/providers/PartnerProvider", () => ({
  usePartner: () => mockUsePartner(),
}));
vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children, ...props }: any) => <div data-testid="avatar" {...props}>{children}</div>,
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  AvatarImage: (props: any) => <img {...props} />,
  AvatarFallback: ({ children, ...props }: any) => <span {...props}>{children}</span>,
}));
vi.mock("@/components/ui/separator", () => ({
  Separator: () => <hr />,
}));

beforeEach(() => {
  mockUseSession.mockReturnValue({
    data: { user: { name: "Jane Doe", email: "jane@example.com", image: null } },
  });
  mockUseTheme.mockReturnValue({ theme: "system", cycleTheme: vi.fn() });
  mockUsePartner.mockReturnValue({ partner: null });
  mockSignOut.mockClear();
  mockFirebaseSignOut.mockClear();
});

describe("NavUserMenu", () => {
  it("renders the avatar button", () => {
    render(<NavUserMenu />);
    expect(screen.getByTestId("avatar")).toBeInTheDocument();
  });

  it("shows user initials in the avatar fallback", () => {
    render(<NavUserMenu />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("falls back to email initials when name is missing", () => {
    mockUseSession.mockReturnValue({
      data: { user: { name: null, email: "jane@example.com" } },
    });

    render(<NavUserMenu />);
    expect(screen.getByText("JA")).toBeInTheDocument();
  });

  it("does not show the dropdown by default", () => {
    render(<NavUserMenu />);
    expect(screen.queryByText("Jane Doe")).not.toBeInTheDocument();
  });

  it("shows the dropdown with user info when clicked", async () => {
    const user = userEvent.setup();
    render(<NavUserMenu />);

    await user.click(screen.getByTestId("avatar").closest("button")!);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("shows theme toggle with system mode label", async () => {
    const user = userEvent.setup();
    render(<NavUserMenu />);

    await user.click(screen.getByTestId("avatar").closest("button")!);
    expect(screen.getByText("System mode")).toBeInTheDocument();
  });

  it("calls cycleTheme when theme button is clicked", async () => {
    const cycleTheme = vi.fn();
    mockUseTheme.mockReturnValue({ theme: "light", cycleTheme });

    const user = userEvent.setup();
    render(<NavUserMenu />);

    await user.click(screen.getByTestId("avatar").closest("button")!);
    await user.click(screen.getByText("Light mode"));

    expect(cycleTheme).toHaveBeenCalledOnce();
  });

  it("calls firebase and next-auth signOut when sign out is clicked", async () => {
    const user = userEvent.setup();
    render(<NavUserMenu />);

    await user.click(screen.getByTestId("avatar").closest("button")!);
    await user.click(screen.getByText("Sign Out"));

    expect(mockFirebaseSignOut).toHaveBeenCalledOnce();
    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it("shows partner info when partner exists with logo", async () => {
    mockUsePartner.mockReturnValue({
      partner: { name: "Acme Corp", logo_url: "https://example.com/logo.png" },
    });

    const user = userEvent.setup();
    render(<NavUserMenu />);

    await user.click(screen.getByTestId("avatar").closest("button")!);

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByAltText("Acme Corp")).toBeInTheDocument();
  });

  it("shows Building icon when partner has no logo_url", async () => {
    mockUsePartner.mockReturnValue({
      partner: { name: "No Logo Inc", logo_url: null },
    });

    const user = userEvent.setup();
    render(<NavUserMenu />);

    await user.click(screen.getByTestId("avatar").closest("button")!);

    expect(screen.getByText("No Logo Inc")).toBeInTheDocument();
    expect(screen.queryByAltText("No Logo Inc")).not.toBeInTheDocument();
  });

  it("does not show partner section for non-partner users", async () => {
    const user = userEvent.setup();
    render(<NavUserMenu />);

    await user.click(screen.getByTestId("avatar").closest("button")!);

    expect(screen.queryByText("Acme Corp")).not.toBeInTheDocument();
  });

  it("closes dropdown when backdrop is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<NavUserMenu />);

    await user.click(screen.getByTestId("avatar").closest("button")!);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();

    const backdrop = container.querySelector(".fixed.inset-0") as HTMLElement;
    await user.click(backdrop);
    expect(screen.queryByText("Jane Doe")).not.toBeInTheDocument();
  });
});

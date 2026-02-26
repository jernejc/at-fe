import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Nav } from "./Nav";

const mockUseSession = vi.fn();
const mockUseNavRoutes = vi.fn();
const mockUsePartner = vi.fn();
const mockUsePathname = vi.fn();

vi.mock("next/navigation", () => ({ usePathname: () => mockUsePathname() }));
vi.mock("next-auth/react", () => ({ useSession: () => mockUseSession() }));
vi.mock("./useNavRoutes", () => ({ useNavRoutes: () => mockUseNavRoutes() }));
vi.mock("@/components/providers/PartnerProvider", () => ({
  usePartner: () => mockUsePartner(),
}));
vi.mock("./NavNotifications", () => ({
  NavNotifications: () => <div data-testid="nav-notifications" />,
}));
vi.mock("./NavUserMenu", () => ({
  NavUserMenu: () => <div data-testid="nav-user-menu" />,
}));
vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));
vi.mock("./NavSkeleton", () => ({
  NavSkeleton: () => <nav aria-hidden="true" className="h-24" data-testid="nav-skeleton" />,
}));

const pdmRoutes = [
  { label: "Campaigns", href: "/" },
  { label: "Partners", href: "/partner-portal" },
  { label: "Discovery", href: "/discovery" },
];

beforeEach(() => {
  mockUsePathname.mockReturnValue("/");
  mockUseSession.mockReturnValue({ data: { user: { name: "Test" } }, status: "authenticated" });
  mockUseNavRoutes.mockReturnValue({ routes: pdmRoutes, activeHref: "/" });
  mockUsePartner.mockReturnValue({ partner: null });
});

describe("Nav", () => {
  it("renders nothing on the signin page", () => {
    mockUsePathname.mockReturnValue("/signin");

    const { container } = render(<Nav />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing on signin sub-routes", () => {
    mockUsePathname.mockReturnValue("/signin/verify");

    const { container } = render(<Nav />);
    expect(container.innerHTML).toBe("");
  });

  it("renders skeleton nav while session is loading", () => {
    mockUseSession.mockReturnValue({ data: null, status: "loading" });

    render(<Nav />);
    expect(screen.getByTestId("nav-skeleton")).toBeInTheDocument();
  });

  it("renders nothing when there is no session", () => {
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated" });

    const { container } = render(<Nav />);
    expect(container.innerHTML).toBe("");
  });

  it("renders the LookAcross brand text", () => {
    render(<Nav />);
    expect(screen.getByText("LookAcross")).toBeInTheDocument();
  });

  it("renders all route tabs", () => {
    render(<Nav />);

    expect(screen.getByText("Campaigns")).toBeInTheDocument();
    expect(screen.getByText("Partners")).toBeInTheDocument();
    expect(screen.getByText("Discovery")).toBeInTheDocument();
  });

  it("renders NavNotifications and NavUserMenu", () => {
    render(<Nav />);

    expect(screen.getByTestId("nav-notifications")).toBeInTheDocument();
    expect(screen.getByTestId("nav-user-menu")).toBeInTheDocument();
  });

  it("does not show partner logo when partner is null", () => {
    render(<Nav />);
    expect(screen.queryByAltText("Acme Corp")).not.toBeInTheDocument();
  });

  it("shows partner logo when partner has logo_url", () => {
    mockUsePartner.mockReturnValue({
      partner: { name: "Acme Corp", logo_url: "https://example.com/logo.png" },
    });

    render(<Nav />);
    const logo = screen.getByAltText("Acme Corp");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "https://example.com/logo.png");
  });

  it("shows separator SVG when partner exists", () => {
    mockUsePartner.mockReturnValue({
      partner: { name: "Acme Corp", logo_url: "https://example.com/logo.png" },
    });

    const { container } = render(<Nav />);
    const svg = container.querySelector("svg line");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("stroke", "currentColor");
  });

  it("shows partner logo container without image when logo_url is null", () => {
    mockUsePartner.mockReturnValue({
      partner: { name: "Acme Corp", logo_url: null },
    });

    const { container } = render(<Nav />);
    // Separator SVG should still be present
    expect(container.querySelector("svg line")).toBeInTheDocument();
    // But no partner logo image
    expect(screen.queryByAltText("Acme Corp")).not.toBeInTheDocument();
  });

  it("applies active styling to the current route tab", () => {
    mockUseNavRoutes.mockReturnValue({ routes: pdmRoutes, activeHref: "/partner-portal" });

    render(<Nav />);

    const partnersLink = screen.getByText("Partners").closest("a");
    expect(partnersLink?.className).toContain("border-foreground");

    const campaignsLink = screen.getByText("Campaigns").closest("a");
    expect(campaignsLink?.className).toContain("border-transparent");
  });
});

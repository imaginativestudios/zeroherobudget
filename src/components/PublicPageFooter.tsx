import { Link, useLocation } from "react-router-dom";
import { LegalFooterNotice } from "@/components/LegalFooterNotice";

// Other pages already render a footer themselves or through Layout.
const standalonePaths = new Set([
  "/auth", "/reset-password", "/data-privacy", "/install",
  "/debt-payoff-calculator",
  "/internal/style-guide/icons", "/internal/style-guide/colors",
  "/internal/sitemap", "/internal/unavailable", "/internal/join-beta",
  "/admin", "/admin/login", "/admin/waitlist", "/admin/beta-codes",
]);

export function PublicPageFooter() {
  const { pathname } = useLocation();
  if (!standalonePaths.has(pathname) && !pathname.startsWith("/accept-invite/")) return null;

  return (
    <footer className="bg-background px-4 pb-8">
      <nav aria-label="Public footer" className="mx-auto flex max-w-6xl flex-wrap gap-4 py-4 text-sm">
        <Link to="/debt-payoff-calculator" className="inline-flex min-h-11 items-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Debt payoff calculator</Link>
      </nav>
      <LegalFooterNotice className="mt-0" />
    </footer>
  );
}
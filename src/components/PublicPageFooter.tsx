import { useLocation } from "react-router-dom";
import { LegalFooterNotice } from "@/components/LegalFooterNotice";

// Other pages already render a footer themselves or through Layout.
const standalonePaths = new Set([
  "/auth", "/reset-password", "/data-privacy", "/install",
  "/internal/style-guide/icons", "/internal/style-guide/colors",
  "/internal/sitemap", "/internal/unavailable", "/internal/join-beta",
  "/admin", "/admin/login", "/admin/waitlist", "/admin/beta-codes",
]);

export function PublicPageFooter() {
  const { pathname } = useLocation();
  if (!standalonePaths.has(pathname) && !pathname.startsWith("/accept-invite/")) return null;

  return (
    <footer className="bg-background px-4 pb-8">
      <LegalFooterNotice className="mt-0" />
    </footer>
  );
}
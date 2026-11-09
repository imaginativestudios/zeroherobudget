import { cn } from "@/lib/utils";

export function LegalFooterNotice({ className }: { className?: string }) {
  return (
    <div className={cn("mt-6 pt-6 border-t border-border/50", className)}>
      <p className="max-w-3xl mx-auto text-center text-xs leading-relaxed text-muted-foreground">
        © 2026 Imaginative Studios LLC. All rights reserved. Zero Hero™ and the Zero Hero logo are
        trademarks of Imaginative Studios LLC, doing business as Zero Hero. Disclaimer: Zero Hero is
        an AI-powered financial literacy coach and debt-tracking application designed for educational
        and informational purposes only. Zero Hero does not provide official legal, tax, or investment
        advice, and is not a financial institution, credit counselor, or registered investment
        advisor. For specific financial decisions, please consult with a qualified professional.
      </p>
    </div>
  );
}

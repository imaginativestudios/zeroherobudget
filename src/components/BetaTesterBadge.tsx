import { useState } from "react";
import { useLocation } from "react-router-dom";
import { FlaskConical, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBetaAccess } from "@/hooks/useBetaAccess";

export function BetaTesterBadge() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const location = useLocation();
  const { isBeta } = useBetaAccess();

  if (!isBeta) return null;

  const handleSubmit = () => {
    const subject = encodeURIComponent("Zero Hero Beta Feedback");
    const body = encodeURIComponent(
      `Page: ${window.location.origin}${location.pathname}\nBrowser: ${navigator.userAgent}\n\nFeedback:\n${feedback}`
    );
    window.open(`mailto:feedback@zeroherobudget.com?subject=${subject}&body=${body}`, "_self");
    setFeedback("");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 z-50">
      {isOpen ? (
        <Card className="w-72 shadow-lg border-primary/20 animate-in slide-in-from-bottom-2 duration-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-primary" />
              Beta Feedback
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Describe the bug or share feedback…"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[80px] text-sm"
            />
            <Button size="sm" className="w-full" onClick={handleSubmit} disabled={!feedback.trim()}>
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Send Feedback
            </Button>
          </CardContent>
        </Card>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-royal hover:scale-105 transition-transform duration-150"
        >
          <FlaskConical className="h-3.5 w-3.5" />
          Beta
        </button>
      )}
    </div>
  );
}

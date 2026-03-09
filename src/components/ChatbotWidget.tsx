import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const QUICK_SUGGESTIONS = [
  "What is Zero Hero?",
  "How do I set up a budget?",
  "What's the 50/30/20 rule?",
  "Should I use snowball or avalanche?",
  "How much emergency fund do I need?",
];

export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    const userMessage: Message = {
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsStreaming(true);

    // Create assistant message placeholder
    const assistantMessage: Message = {
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      abortControllerRef.current = new AbortController();

      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Please sign in to use the assistant.");
      }

      const response = await fetch(
        `https://ukpejgrghpewwdfztryg.supabase.co/functions/v1/faq-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let accumulatedContent = "";

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            
            if (content) {
              accumulatedContent += content;
              // Update the last message with accumulated content
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === "assistant") {
                  lastMessage.content = accumulatedContent;
                }
                return newMessages;
              });
            }
          } catch (e) {
            // Incomplete JSON, put it back
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw || raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              accumulatedContent += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === "assistant") {
                  lastMessage.content = accumulatedContent;
                }
                return newMessages;
              });
            }
          } catch {
            // Ignore partial leftovers
          }
        }
      }

    } catch (error: any) {
      console.error("Chat error:", error);
      
      if (error.name === "AbortError") {
        return;
      }

      const errorMessage = error.message === "I'm a bit busy right now. Please try again in a moment."
        ? error.message
        : error.message === "The assistant is temporarily unavailable. Please try again later."
        ? error.message
        : "Sorry, I encountered an error. Please try again.";

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === "assistant") {
          lastMessage.content = errorMessage;
        }
        return newMessages;
      });
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <div className="fixed bottom-20 lg:bottom-4 right-4 z-50" data-tour="chatbot-widget">
      {/* Chat Panel */}
      <div
        id="chat-panel"
        role="dialog"
        aria-label="Zero Hero Assistant chat"
        aria-hidden={!isOpen}
        className={cn(
          "absolute bottom-16 right-0 w-[90vw] max-w-[380px] transition-all duration-300 ease-in-out origin-bottom-right",
          isOpen
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        <div className="bg-card border border-border rounded-lg shadow-2xl flex flex-col h-[450px] max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary via-primary-light to-primary rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-white" aria-hidden="true" />
              <div>
                <h3 id="chat-title" className="font-semibold text-white">Zero Hero Assistant</h3>
                <p className="text-[10px] text-white/70">AI-powered • Not financial advice</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-white hover:bg-white/20"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef} aria-live="polite" aria-atomic="false">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    👋 Hi! I'm your AI-powered Zero Hero assistant. Ask me anything about budgeting, debt payoff strategies, or how to use the app!
                  </p>
                  <p className="text-[11px] text-muted-foreground/80 mb-3 italic border-l-2 border-muted pl-2">
                    Note: I may occasionally provide inaccurate information. My responses are for educational purposes only and do not constitute personalized financial, legal, or tax advice.
                  </p>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Quick questions:
                    </p>
                    {QUICK_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left text-sm px-3 py-2 rounded-md bg-background hover:bg-muted transition-colors border border-border"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-lg p-3 text-sm",
                        message.role === "user"
                          ? "bg-accent/20 text-foreground ml-auto"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {message.content || (
                        <div className="flex items-center gap-2" role="status" aria-label="Loading response">
                          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                          <span className="text-xs text-muted-foreground">Thinking...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-border">
            <p className="text-[10px] text-muted-foreground/60 text-center mb-2">
              AI responses may contain errors. Verify with a professional.
            </p>
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a question..."
                disabled={isStreaming}
                className="flex-1"
                aria-label="Type your message"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || isStreaming}
                className="shrink-0"
                aria-label={isStreaming ? "Sending message" : "Send message"}
              >
                {isStreaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>


      {/* Floating Bubble */}
      <Button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!hasOpened) setHasOpened(true);
        }}
        size="icon"
        className="h-16 w-16 rounded-full shadow-[0_0_20px_hsl(var(--primary)/0.4)] bg-primary hover:bg-primary-light transition-all duration-300 hover:scale-110"
        aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={isOpen}
        aria-controls="chat-panel"
      >
        {isOpen ? (
          <X className="h-7 w-7 text-primary-foreground" aria-hidden="true" />
        ) : (
          <Sparkles className="h-8 w-8 text-primary-foreground" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
};

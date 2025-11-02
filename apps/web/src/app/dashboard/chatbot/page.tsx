"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ui/tool";
import type { ToolUIPart } from "ai";
import { MessageSquare, Send } from "lucide-react";

export default function ChatbotPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare className="h-8 w-8" />
        <h1 className="text-4xl font-bold">Finance Assistant</h1>
      </div>

      <Card className="h-[calc(100vh-250px)] flex flex-col">
        <CardHeader>
          <CardTitle>Chat with your Finance Assistant</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 p-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <p>Ask me anything about your finances!</p>
                <p className="text-sm mt-2">
                  Try: "Berapa total income bulan ni?" or "What are my expenses
                  this month?"
                </p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] space-y-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-lg p-4"
                      : ""
                  }`}
                >
                  {message.role === "user" ? (
                    <>
                      <div className="font-semibold mb-1">You</div>
                      <div className="whitespace-pre-wrap">
                        {message.parts.map((part, index) => {
                          if (part.type === "text") {
                            return <span key={index}>{part.text}</span>;
                          }
                          return null;
                        })}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-semibold mb-2">Assistant</div>
                      <div className="space-y-2">
                        {message.parts.map((part, index) => {
                          if (part.type === "text") {
                            return (
                              <div
                                key={index}
                                className="bg-muted rounded-lg p-4 whitespace-pre-wrap"
                              >
                                {part.text}
                              </div>
                            );
                          }
                          if (
                            part.type.startsWith("tool-") &&
                            "toolCallId" in part
                          ) {
                            const toolPart = part as ToolUIPart;
                            return (
                              <Tool key={toolPart.toolCallId} defaultOpen>
                                <ToolHeader
                                  type={toolPart.type}
                                  state={toolPart.state}
                                />
                                <ToolContent>
                                  <ToolInput input={toolPart.input} />
                                  {toolPart.state === "output-available" ||
                                  toolPart.state === "output-error" ? (
                                    <ToolOutput
                                      output={toolPart.output}
                                      errorText={toolPart.errorText}
                                    />
                                  ) : null}
                                </ToolContent>
                              </Tool>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                  <div className="font-semibold mb-1">Assistant</div>
                  <div>Thinking...</div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-4 bg-destructive/10 border border-destructive/20">
                  <div className="font-semibold mb-1 text-destructive">
                    Error
                  </div>
                  <div className="text-destructive">
                    {error.message || "An error occurred"}
                  </div>
                </div>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your finances..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

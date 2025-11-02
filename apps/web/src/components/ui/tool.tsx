"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import {
  ChevronDown,
  Circle,
  Clock,
  CheckCircle2,
  XCircle,
  Wrench,
} from "lucide-react";
import type { ToolUIPart } from "ai";

type ToolState = ToolUIPart["state"];

const getStatusBadge = (state: ToolState) => {
  const labels: Record<ToolState, string> = {
    "input-streaming": "Pending",
    "input-available": "Running",
    "approval-requested": "Awaiting Approval",
    "approval-responded": "Responded",
    "output-available": "Completed",
    "output-error": "Error",
    "output-denied": "Denied",
  };

  const icons: Record<ToolState, React.ReactNode> = {
    "input-streaming": <Circle className="size-3" />,
    "input-available": <Clock className="size-3 animate-pulse" />,
    "approval-requested": <Clock className="size-3 text-yellow-600" />,
    "approval-responded": <CheckCircle2 className="size-3 text-blue-600" />,
    "output-available": <CheckCircle2 className="size-3 text-green-600" />,
    "output-error": <XCircle className="size-3 text-red-600" />,
    "output-denied": <XCircle className="size-3 text-orange-600" />,
  };

  const variants: Record<ToolState, "default" | "secondary" | "destructive" | "warning"> = {
    "input-streaming": "secondary",
    "input-available": "secondary",
    "approval-requested": "warning",
    "approval-responded": "default",
    "output-available": "success",
    "output-error": "destructive",
    "output-denied": "warning",
  };

  return (
    <Badge variant={variants[state]} className="gap-1.5 rounded-full text-xs">
      {icons[state]}
      {labels[state]}
    </Badge>
  );
};

export type ToolProps = React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
};

const ToolContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

const Tool = React.forwardRef<HTMLDivElement, ToolProps>(
  ({ className, defaultOpen = false, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
      <ToolContext.Provider value={{ isOpen, setIsOpen }}>
        <div
          ref={ref}
          className={cn(
            "border rounded-lg overflow-hidden bg-card",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </ToolContext.Provider>
    );
  }
);
Tool.displayName = "Tool";

export type ToolHeaderProps = React.ComponentProps<"div"> & {
  title?: string;
  type: string;
  state: ToolState;
  isOpen?: boolean;
};

export const ToolHeader = React.forwardRef<HTMLDivElement, ToolHeaderProps>(
  ({ className, title, type, state, isOpen: isOpenProp, ...props }, ref) => {
    const context = React.useContext(ToolContext);
    const isOpen = isOpenProp ?? context.isOpen;
    const setIsOpen = context.setIsOpen;

    return (
      <div
        ref={ref}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between gap-4 p-3 hover:bg-muted/50 transition-colors cursor-pointer",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          <Wrench className="size-4 text-muted-foreground" />
          <span className="font-medium text-sm">
            {title ?? type.split("-").slice(1).join("-")}
          </span>
          {getStatusBadge(state)}
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </div>
    );
  }
);
ToolHeader.displayName = "ToolHeader";

export type ToolContentProps = React.ComponentProps<"div">;

export const ToolContent = React.forwardRef<HTMLDivElement, ToolContentProps>(
  ({ className, ...props }, ref) => {
    const { isOpen } = React.useContext(ToolContext);

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "border-t text-popover-foreground outline-none",
          className
        )}
        {...props}
      />
    );
  }
);
ToolContent.displayName = "ToolContent";

export type ToolInputProps = React.ComponentProps<"div"> & {
  input: ToolUIPart["input"];
};

export const ToolInput = React.forwardRef<HTMLDivElement, ToolInputProps>(
  ({ className, input, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-2 overflow-hidden p-4", className)}
      {...props}
    >
      <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        Parameters
      </h4>
      <div className="rounded-md bg-muted/50 p-3 overflow-x-auto">
        <pre className="text-xs">
          {JSON.stringify(input, null, 2)}
        </pre>
      </div>
    </div>
  )
);
ToolInput.displayName = "ToolInput";

export type ToolOutputProps = React.ComponentProps<"div"> & {
  output: ToolUIPart["output"];
  errorText: ToolUIPart["errorText"];
};

export const ToolOutput = React.forwardRef<HTMLDivElement, ToolOutputProps>(
  ({ className, output, errorText, ...props }, ref) => {
    if (!(output || errorText)) {
      return null;
    }

    let Output: React.ReactNode = null;

    if (errorText) {
      Output = <div className="text-destructive">{errorText}</div>;
    } else if (typeof output === "object" && output !== null) {
      Output = (
        <pre className="text-xs whitespace-pre-wrap">
          {JSON.stringify(output, null, 2)}
        </pre>
      );
    } else if (typeof output === "string") {
      Output = <pre className="text-xs whitespace-pre-wrap">{output}</pre>;
    }

    return (
      <div
        ref={ref}
        className={cn("space-y-2 p-4", className)}
        {...props}
      >
        <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          {errorText ? "Error" : "Result"}
        </h4>
        <div
          className={cn(
            "overflow-x-auto rounded-md text-xs p-3",
            errorText
              ? "bg-destructive/10 text-destructive"
              : "bg-muted/50 text-foreground"
          )}
        >
          {Output}
        </div>
      </div>
    );
  }
);
ToolOutput.displayName = "ToolOutput";

export { Tool };


import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-primary/10 text-primary hover:bg-primary/15",
    secondary: "border-transparent bg-secondary/20 text-secondary-foreground hover:bg-secondary/30",
    destructive: "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/15",
    outline: "text-foreground border-border/40 hover:bg-muted/30",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-ring",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }

import * as React from "react"
import { cn } from "../../lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }
>(({ className, hover = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "glass-panel rounded-2xl p-6",
      hover && "glass-panel-hover",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

export { Card }

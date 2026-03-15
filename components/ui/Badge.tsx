import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'neon' | 'cyan' | 'purple' | 'zinc' | 'outline'
}

function Badge({ className, variant = 'zinc', ...props }: BadgeProps) {
  const variants = {
    neon: "bg-[#00FF9D]/10 text-[#00FF9D] border-[#00FF9D]/30 shadow-[0_0_10px_rgba(0,255,157,0.1)]",
    cyan: "bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/30 shadow-[0_0_10px_rgba(0,229,255,0.1)]",
    purple: "bg-[#B026FF]/10 text-[#B026FF] border-[#B026FF]/30 shadow-[0_0_10px_rgba(176,38,255,0.1)]",
    zinc: "bg-white/5 text-zinc-300 border-white/10",
    outline: "bg-transparent text-zinc-500 border-white/10",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono transition-colors backdrop-blur-sm",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }

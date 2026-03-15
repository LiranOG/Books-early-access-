import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glow' | 'neon'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: "bg-white/10 text-white hover:bg-white/15 border border-white/10",
      secondary: "bg-transparent text-zinc-300 border border-white/10 hover:bg-white/5 hover:text-white",
      ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5",
      glow: "bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/30 hover:bg-[#00FF9D]/20 hover:shadow-[0_0_20px_rgba(0,255,157,0.3)]",
      neon: "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 hover:bg-[#00E5FF]/20 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]",
    }

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-2.5 text-sm",
      lg: "px-8 py-3.5 text-base",
      icon: "p-2.5",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none backdrop-blur-md",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

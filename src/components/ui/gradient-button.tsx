// frontend/src/components/ui/rainbow-button.tsx

import React from "react";
import { cn } from "@/lib/utils";

export function RainbowButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "group relative inline-flex h-12 animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-8 py-2 font-bold text-white transition-all duration-300 [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:scale-105",
        // before styles for the glow
        "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-2/5 before:w-4/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))]",
        // dark mode colors (our primary theme)
        "bg-[linear-gradient(#0D1117,#0D1117),linear-gradient(#0D1117_50%,rgba(13,17,23,0.6)_80%,rgba(13,17,23,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
        className,
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
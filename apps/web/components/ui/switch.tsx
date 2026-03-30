"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { onCheckedChange?: (checked: boolean) => void }
>(({ className, checked, defaultChecked, onCheckedChange, ...props }, ref) => {
  const [localChecked, setLocalChecked] = React.useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const state = isControlled ? checked : localChecked;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isControlled) {
        setLocalChecked(!state);
    }
    onCheckedChange?.(!state);
    props.onClick?.(e);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={state}
      data-state={state ? "checked" : "unchecked"}
      ref={ref}
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <span
        data-state={state ? "checked" : "unchecked"}
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
      />
    </button>
  )
})
Switch.displayName = "Switch"

export { Switch }

import React from "react"
import { Button, ButtonProps } from "./button"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

interface IconButtonProps extends Omit<ButtonProps, "asChild"> {
  icon: React.ReactNode
  tooltip?: string
  tooltipSide?: "top" | "right" | "bottom" | "left"
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "ghost", size = "icon", icon, tooltip, tooltipSide = "top", ...props }, ref) => {
    const button = (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn("rounded-full", className)}
        {...props}
      >
        {icon}
      </Button>
    )

    if (tooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side={tooltipSide}>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return button
  }
)
IconButton.displayName = "IconButton"

export { IconButton } 
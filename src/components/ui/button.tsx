import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 border border-transparent bg-clip-padding text-[15px] font-bold tracking-[-0.009em] whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "rounded-[9999px] bg-primary text-primary-foreground hover:opacity-90",
        outline:
          "rounded-[9999px] border-border bg-background text-foreground hover:bg-muted aria-expanded:bg-muted",
        secondary:
          "rounded-[9999px] bg-secondary text-secondary-foreground hover:bg-muted aria-expanded:bg-secondary",
        ghost:
          "rounded-[9999px] font-normal hover:bg-muted hover:text-foreground aria-expanded:bg-muted",
        destructive:
          "rounded-[9999px] bg-[var(--color-carbon-black)] text-[var(--color-paper-white)] hover:opacity-90",
        link: "rounded-none font-normal text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-1.5 px-5",
        xs: "h-7 gap-1 rounded-[9999px] px-3 text-[13px]",
        sm: "h-8 gap-1 rounded-[9999px] px-4 text-[13px]",
        lg: "h-12 gap-2 rounded-[9999px] px-7 text-[15px]",
        icon: "size-10 rounded-[9999px]",
        "icon-xs": "size-7 rounded-[9999px] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-[9999px] [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-11 rounded-[9999px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

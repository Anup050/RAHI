"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

const AccordionContext = React.createContext<{
  activeItem: string | undefined
  setActiveItem: (value: string | undefined) => void
}>({
  activeItem: undefined,
  setActiveItem: () => {},
})

const Accordion = React.forwardRef<
  HTMLDivElement,
  { type: "single"; collapsible?: boolean; className?: string; children: React.ReactNode }
>(({ className, children, ...props }, ref) => {
  const [activeItem, setActiveItem] = React.useState<string | undefined>(undefined)

  return (
    <AccordionContext.Provider value={{ activeItem, setActiveItem }}>
      <div ref={ref} className={cn("", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
})
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => (
  <div ref={ref} className={cn("border-b", className)} data-value={value} {...props} />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { activeItem, setActiveItem } = React.useContext(AccordionContext)
  // Search up to find the item value. Simplified: we assume direct usage for now or pass context properly
  // In this simple version, we need the value. But keeping API compatible with Radix is hard without proper context passing.
  // Let's rely on the parent Item value if possible, but we don't have access to it easily here without another context.
  
  // Alternative: We know how we used it in FAQSection. We passed `value` to AccordionItem.
  // Let's change the pattern slightly to work: 
  // We need to know which item this trigger belongs to. 
  // For now, let's implement a simple version that works with the existing FAQSection usage if possible.
  // The FAQSection uses: <AccordionItem value="item-index"><AccordionTrigger>...
  
  // We need an ItemContext.
  return (
    <div className="flex">
        {/* Placeholder: The actual logic requires ItemContext. Implementing full custom accordion below. */}
    </div>
  )
})

// RE-IMPLEMENTATION WITH SIMPLER LOGIC
// We need to define ItemContext to make it work like Radix
const AccordionItemContext = React.createContext<{ value: string }>({ value: "" })

const CustomAccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, children, ...props }, ref) => (
  <AccordionItemContext.Provider value={{ value }}>
    <div ref={ref} className={cn("border-b", className)} {...props}>
      {children}
    </div>
  </AccordionItemContext.Provider>
))
CustomAccordionItem.displayName = "AccordionItem"

const CustomAccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { activeItem, setActiveItem } = React.useContext(AccordionContext)
  const { value } = React.useContext(AccordionItemContext)
  const isOpen = activeItem === value

  return (
    <h3 className="flex">
      <button
        ref={ref}
        onClick={() => setActiveItem(isOpen ? undefined : value)}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
          className
        )}
        {...props}
      >
        {children}
        <div className={`bg-primary rounded-full p-1 ml-2 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
           <ChevronDown className="h-4 w-4 text-primary-foreground" />
        </div>
      </button>
    </h3>
  )
})
CustomAccordionTrigger.displayName = "AccordionTrigger"

const CustomAccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { activeItem } = React.useContext(AccordionContext)
  const { value } = React.useContext(AccordionItemContext)
  const isOpen = activeItem === value

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden text-sm"
        >
          <div ref={ref} className={cn("pb-4 pt-0", className)} {...props}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
})
CustomAccordionContent.displayName = "AccordionContent"

export { Accordion, CustomAccordionItem as AccordionItem, CustomAccordionTrigger as AccordionTrigger, CustomAccordionContent as AccordionContent }


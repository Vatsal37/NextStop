import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function DatePicker({ date, onDateChange, placeholder = "Pick a date", className, disabled, fromYear = 1900, toYear = new Date().getFullYear() }) {
  const [open, setOpen] = React.useState(false)

  const handleDateSelect = (selectedDate) => {
    onDateChange(selectedDate)
    setOpen(false) // Close the popover when date is selected
  }

  // Normalize any incoming date to local midnight to avoid timezone drift
  const normalizedDate = React.useMemo(() => {
    if (!date) return null
    const y = date.getFullYear()
    const m = date.getMonth()
    const d = date.getDate()
    return new Date(y, m, d)
  }, [date])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-white border-gray-300 text-gray-900 hover:bg-gray-50",
            !date && "text-gray-500",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {normalizedDate ? format(normalizedDate, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white border-gray-200">
        <Calendar
          mode="single"
          selected={normalizedDate || undefined}
          onSelect={handleDateSelect}
          disabled={disabled}
          defaultMonth={normalizedDate || new Date()}
          captionLayout="dropdown"
          fromYear={fromYear}
          toYear={toYear}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

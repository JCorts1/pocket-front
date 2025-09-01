"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <div className={cn("p-3", className)}>
      <style jsx>{`
        .calendar-container .rdp {
          margin: 0;
        }
        .calendar-container .rdp-months {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        @media (min-width: 640px) {
          .calendar-container .rdp-months {
            flex-direction: row;
            gap: 2rem;
          }
        }
        .calendar-container .rdp-month {
          width: 100%;
        }
        .calendar-container .rdp-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .calendar-container .rdp-head_row,
        .calendar-container .rdp-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }
        .calendar-container .rdp-head_cell {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 500;
          color: #6b7280;
          padding: 0.5rem 0;
        }
        .calendar-container .rdp-cell {
          text-align: center;
        }
        .calendar-container .rdp-day {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 400;
          color: #374151;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .calendar-container .rdp-day:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .calendar-container .rdp-day_selected {
          background: #ec4899 !important;
          color: white !important;
        }
        .calendar-container .rdp-day_selected:hover {
          background: #db2777 !important;
        }
        .calendar-container .rdp-day_today {
          background: rgba(255, 255, 255, 0.3);
          font-weight: 600;
        }
        .calendar-container .rdp-day_outside {
          color: #9ca3af;
          opacity: 0.5;
        }
        .calendar-container .rdp-day_disabled {
          color: #9ca3af;
          opacity: 0.3;
          cursor: not-allowed;
        }
        .calendar-container .rdp-caption {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          margin-bottom: 1rem;
        }
        .calendar-container .rdp-caption_label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }
        .calendar-container .rdp-nav {
          position: absolute;
          width: 100%;
          display: flex;
          justify-content: space-between;
          pointer-events: none;
        }
        .calendar-container .rdp-nav_button {
          width: 28px;
          height: 28px;
          border-radius: 0.375rem;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          pointer-events: auto;
          transition: all 0.2s;
        }
        .calendar-container .rdp-nav_button:hover {
          background: rgba(255, 255, 255, 0.3);
          color: #374151;
        }
      `}</style>
      <div className="calendar-container">
        <DayPicker
          showOutsideDays={showOutsideDays}
          components={{
            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
            IconRight: () => <ChevronRight className="h-4 w-4" />,
          }}
          {...props}
        />
      </div>
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

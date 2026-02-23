'use client'

import { useState, useRef, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'

interface DatePickerInputProps {
  value: string // YYYY-MM-DD
  onChange: (date: string) => void
  min?: string // YYYY-MM-DD
  label: string
  id: string
  required?: boolean
  inputStyle?: React.CSSProperties
  labelStyle?: React.CSSProperties
}

export default function DatePickerInput({ value, onChange, min, label, id, required, inputStyle, labelStyle }: DatePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedDate = value ? new Date(value + 'T00:00:00') : undefined
  const disabledBefore = min ? new Date(min + 'T00:00:00') : undefined

  const formatDisplay = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T00:00:00')
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(d)
  }

  return (
    <div ref={containerRef} className="relative">
      {label && <label htmlFor={id} className="block text-sm font-medium mb-2" style={labelStyle}>{label}</label>}
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 rounded-lg text-base outline-none text-left"
        style={inputStyle}
      >
        {value ? formatDisplay(value) : <span style={{ opacity: 0.5 }}>Select date</span>}
      </button>
      {required && <input type="hidden" name={id} value={value} required />}

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-[#111] border border-[#2a2a2a] rounded-xl p-3 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                onChange(`${year}-${month}-${day}`)
              }
              setIsOpen(false)
            }}
            disabled={disabledBefore ? { before: disabledBefore } : undefined}
            defaultMonth={selectedDate || (disabledBefore ?? new Date())}
          />
        </div>
      )}
    </div>
  )
}

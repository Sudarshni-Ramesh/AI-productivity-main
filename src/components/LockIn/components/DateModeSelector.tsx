import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, startOfMonth } from 'date-fns'
import { getEndDate } from '../utils'
import { Switch, FormControlLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material'
import useAppStore from '../../state-utils/state-management'

const DateModeSelector = () => {
  const { viewMode, setViewMode, dateMode, setDateMode, currentDate, setCurrentDate } = useAppStore()
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(startOfMonth(new Date()))
  const [view, setView] = useState<'Event View' | 'Calendar View'>('Event View')

  // console.log("currentDate:", currentDate);



  useEffect(() => {
    // if (selectedDate) {
    //   onDateModeChange({
    //     startDate: selectedDate,
    //     endDate: getEndDate(selectedDate, dateMode),
    //     viewMode : view,
    //     dateMode : dateMode,
    //   });
    // }
    setCurrentDate(selectedDate);
  }, [selectedDate, dateMode, view]);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      switch (dateMode) {
        case 'weekly':
          setSelectedDate(startOfWeek(date, { weekStartsOn: 0 }))
          break
        case 'monthly':
          setSelectedDate(startOfMonth(date))
          break
        default:
          setSelectedDate(date)
      }
    } else {
      setSelectedDate(null)
    }
  }

  const handlePrevDate = () => {
    setSelectedDate(prevDate => {
      if (!prevDate) return null
      switch (dateMode) {
        case 'daily':
          return subDays(prevDate, 1)
        case 'weekly':
          return subWeeks(prevDate, 1)
        case 'monthly':
          return subMonths(prevDate, 1)
        default:
          return prevDate
      }
    })
  }

  const handleNextDate = () => {
    setSelectedDate(prevDate => {
      if (!prevDate) return null
      switch (dateMode) {
        case 'daily':
          return addDays(prevDate, 1)
        case 'weekly':
          return addWeeks(prevDate, 1)
        case 'monthly':
          return addMonths(prevDate, 1)
        default:
          return prevDate
      }
    })
  }

  const handleViewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newView = event.target.checked ? 'calendarView' : 'eventView';
    setViewMode(newView);
  }

  const handleDateModeChange = (event: SelectChangeEvent<'daily' | 'weekly' | 'monthly'>) => {
    const newMode = event.target.value as 'daily' | 'weekly' | 'monthly'
    setDateMode(newMode)
    if (selectedDate) {
      let newDate = selectedDate;
      switch (newMode) {
        case 'weekly':
          newDate = startOfWeek(selectedDate, { weekStartsOn: 0 })
          break
        case 'monthly':
          newDate = startOfMonth(selectedDate)
          break
      }
      setSelectedDate(newDate);
    }
  }

  return (
    <div className="flex items-center justify-center space-x-4 p-4 rounded-lg ">
      <button onClick={handlePrevDate} className="text-gray-600 hover:text-gray-800">
        &lt;
      </button>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        customInput={<CustomDateInput date={selectedDate} dateMode={dateMode} />}
        className="text-center text-sm bg-transparent focus:outline-none border-none"
      />
      <button onClick={handleNextDate} className="text-gray-600 hover:text-gray-800">
        &gt;
      </button>
      <Select
        value={dateMode}
        onChange={handleDateModeChange}
        size="small"
        sx={{ minWidth: 120 }}
      >
        <MenuItem value="daily">Daily</MenuItem>
        <MenuItem value="weekly">Weekly</MenuItem>
        <MenuItem value="monthly">Monthly</MenuItem>
      </Select>
      <FormControlLabel
        control={
          <Switch
            checked={viewMode === 'calendarView'}
            onChange={handleViewChange}
            name="view"
            color="primary"
          />
        }
        label="Calendar View"
      />
    </div>
  )
}

const CustomDateInput = React.forwardRef<HTMLDivElement, { date: Date | null; dateMode: string }>(
  ({ date, dateMode }, ref) => (
    <div ref={ref} className="cursor-pointer">
      {date
        ? dateMode === 'daily'
          ? format(date, 'MMM dd, yyyy')
          : dateMode === 'weekly'
          ? `Week of ${format(date, 'MMM dd, yyyy')}`
          : format(date, 'MMMM yyyy')
        : 'Select Date'}
    </div>
  )
)

export default DateModeSelector

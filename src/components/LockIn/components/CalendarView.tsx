import React, { useState, useMemo } from 'react';
import { Event } from '../types';

import { Calendar, ChevronDown, ChevronUp, Edit } from 'lucide-react';
import { startOfDay, format, parseISO, addDays } from 'date-fns';
import { stringToColor, truncateText } from '../utils';
import useAppStore from '../../state-utils/state-management';
import { getStartAndEndDateForView } from '../../state-utils/utils';

const MAX_VISIBLE_EVENTS = 3;

const CalendarView: React.FC = () => {

    const {
      currentDate,
      viewMode,
      dateMode,
      setDateMode,
      filteredEvents,
      setEditingEvent
    } = useAppStore();

    const { startDate, endDate } = getStartAndEndDateForView();
    
    const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
    const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());


    const getDaysInRange = (start: Date, end: Date) => {
    const days = [];
    let currentDate = new Date(start);
    // console.log("currentDate", currentDate);
    // console.log("start", start);
    // console.log("end", end);
    // console.log("viewMode", viewMode);

    while (currentDate <= new Date(end)) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    // console.log("days", days);
    return days;
  };

  const days = getDaysInRange(startDate, endDate);

  const getEventsForDay = (day: Date) => {
    // console.log("unfilteredEvents", events,day);
    const eventsForDay = filteredEvents.filter(event => {
      const eventStart = new Date(event.startTime);
    //   console.log("eventStart", startOfDay(eventStart));
    //   console.log("day", startOfDay(day));
    //   console.log("equal = ", startOfDay(eventStart).getTime() === startOfDay(day).getTime());
      return startOfDay(eventStart).getTime() === startOfDay(day).getTime();

    });
    // console.log("filteredEvents", filteredEvents);
    return eventsForDay;
  };

  const renderDayEvents = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    
    // Sort events by start time
    const sortedEvents = dayEvents.sort((a, b) => {
      return a.startTime - b.startTime;
    });

    return (
      <>
        {sortedEvents.map(renderEvent)}
      </>
    );
  };

  const renderDayView = () => (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">{format(startDate, 'MMMM d, yyyy')}</h2>
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {renderDayEvents(startDate)}
      </div>
    </div>
  );

  const renderWeekView = () => (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Week of {format(startDate, 'MMMM d, yyyy')}</h2>
      <div className="grid grid-cols-7 gap-2">
        {getDaysInRange(startDate, endDate).map(day => (
        
          <div key={day.toISOString()} className="border p-2" style={{ aspectRatio: '1 / 1', overflowY: 'auto', maxHeight: '200px' }}>
            <h3 className="text-sm font-semibold">{format(day, 'EEE')}</h3>
            <p className="text-xs">{format(day, 'd')}</p>
            {renderDayEvents(day)}
          </div>
        ))}
      </div>
    </div>
  );

  const renderMonthView = () => (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">{format(startDate, 'MMMM yyyy')}</h2>
      <div className="grid grid-cols-7 gap-2">
        {getDaysInRange(startDate, endDate).map(day => (
          <div key={day.toISOString()} className="border p-2 min-h-[100px]" style={{ aspectRatio: '1 / 1', overflowY: 'auto', maxHeight: '200px' }}>
            <p className="text-sm">{format(day, 'd')}</p>
            {renderDayEvents(day)}
          </div>
        ))}
      </div>
    </div>
  );

  const toggleDayExpansion = (day: Date) => {
    const dayKey = format(day, 'yyyy-MM-dd');
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayKey)) {
        newSet.delete(dayKey);
      } else {
        newSet.add(dayKey);
      }
      return newSet;
    });
  };

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };
  console.log("viewMode:", viewMode);
  console.log("dateMode:", dateMode);

  const renderEvent = (event: Event) => {
    const isExpanded = expandedEvents.has(event.id);
    const colorClass = stringToColor(event.projectType);

    return (
      <div 
        key={event.id} 
        className={`${colorClass} p-1 my-1 rounded shadow cursor-pointer transition-all duration-200 ease-in-out relative`}
        onClick={() => toggleEventExpansion(event.id)}
      >
        <div className="flex justify-between items-center">
          <span className="font-semibold text-xs">{truncateText(event.projectType, 10)}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
        {isExpanded && (
          <div className="mt-1 text-xs">
            <p className="font-semibold">{event.name || "Unknown"}</p>
            <p>{format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setEditingEvent(event);
              }} 
              className="absolute bottom-1 right-1 text-gray-500 hover:text-gray-700"
            >
              <Edit size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Updated helper function to return an icon with projectType text
//   const projectTypeColors = useMemo(() => {
//     const colors = ['bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200'];
//     const typeToColorMap = {};
//     events.forEach(event => {
//       if (!typeToColorMap[event.projectType]) {
//         // Assign a random color from the list
//         typeToColorMap[event.projectType] = colors[Math.floor(Math.random() * colors.length)];
//       }
//     });
//     return typeToColorMap;
//   }, [events]); // Dependency on events to recalculate when events change

  const getIconForProjectType = (projectType: string) => {
    const colorClass = projectTypeColors[projectType] || 'bg-gray-200'; // Default color if not mapped
    return <span className={`${colorClass} text-xs px-1 py-0.5 rounded`}>{truncateText(projectType, 5)}</span>; // Truncate project type
  };

  // Add this utility function if not already present
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      {renderMonthView()}
    </div>
  );
};

export default CalendarView;

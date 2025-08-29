import React, { useEffect, useState } from 'react'
import { Edit } from 'lucide-react'
import { Event } from '../types'
import { formatDuration, truncateText, stringToColor } from '../utils'
import useAppStore from '../../state-utils/state-management'
import { fetchAndSetEvents, getStartAndEndDateForView } from '../../state-utils/utils'


const EventList: React.FC = () => {

  const {
    events,
    filteredEvents,
    setEditingEvent
  } = useAppStore();

  const [containerHeight, setContainerHeight] = useState('100vh');

  useEffect(() => {
    fetchAndSetEvents();
    
    // Calculate available height
    const updateHeight = () => {
      const windowHeight = window.innerHeight;
      const offset = 100000; // Adjust this value based on your layout
      setContainerHeight(`${windowHeight - offset}px`);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const { startDate, endDate } = getStartAndEndDateForView();

  // Filter events based on startDate and endDate
  const eventsInRange = filteredEvents.filter(event => {
    const eventStart = new Date(event.startTime);
    return eventStart >= startDate && eventStart <= endDate;
  });

  // console.log("events", events);

  // console.log("filteredEvents", filteredEvents);

  // Group events by date
  const eventsByDate = eventsInRange.reduce((acc, event) => {
    const date = new Date(event.startTime).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  // Sort dates in descending order (most recent first)
  const sortedDates = Object.keys(eventsByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div style={{ height: containerHeight, overflowY: 'auto' }}>
      <ul className="space-y-2">
        {sortedDates.map((date) => {
          const events = eventsByDate[date];
          // Calculate total tracked hours for the day
          const totalTrackedHours = events.reduce((total, event) => {
            return total + (new Date(event.endTime!).getTime() - new Date(event.startTime).getTime()) / 3600000;
          }, 0);

          return (
            <li key={date} className="bg-gray-100 p-3 rounded shadow">
              <div className="flex justify-between items-center">
                <div className="font-bold text-lg">
                  {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
                <div className="text-sm text-gray-600">
                  Total Tracked Hours: {totalTrackedHours.toFixed(2)}
                </div>
              </div>
              <ul className="space-y-2 mt-2">
                {events.sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime()).map((event) => (
                  <li key={event.event_id} className="bg-white p-3 pr-10 rounded shadow flex items-center justify-between space-x-4 relative">
                    <div className="flex items-center space-x-4">
                      <span className={`${stringToColor(event.projectType)} text-gray-800 px-2 py-1 rounded-full text-xs`}>
                        {event.projectType}
                      </span>
                      <div className="font-medium">
                        {truncateText(event.name,20)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end ml-auto mr-8">
                      <div className="text-sm font-semibold text-green-600">
                        {formatDuration(Math.floor((new Date(event.endTime!).getTime() - new Date(event.startTime).getTime()) / 1000))}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(event.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })} - {new Date(event.endTime!).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
                      </div>
                    </div>
                    <button onClick={() => setEditingEvent(event)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                      <Edit size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default EventList

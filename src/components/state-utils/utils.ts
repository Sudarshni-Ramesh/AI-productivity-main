import create from 'zustand';
import { Event } from '../LockIn/types'; // Adjust the import paths as necessary
import { useDBStore } from '../../postgres-db/stores';

import useAppStore from './state-management';
import { convertFromUTCToLocal, convertToUTCDate, parseUTCToLocal } from '../LockIn';
import { endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek } from 'date-fns';

type ViewMode = 'eventView' | 'calendarView';
type DateMode = 'daily' | 'weekly' | 'monthly';

const parseEventRow = (row: any): Event => ({
    event_id: row.event_id,
    name: row.task_name,
    projectType: row.project_type,
    startTime: new Date(row.event_start_time.replace(/"/g, '')), // Ensure correct parsing
    endTime: row.event_end_time ? new Date(row.event_end_time.replace(/"/g, '')) : null
  });


export async function fetchAndSetEvents() {
  const { setEvents,setCurrentEvent, currentEvent } = useAppStore.getState();
  console.log("fetchAndSetEvents");

  try {
    const dbStore = useDBStore.getState(); // Corrected useDBStore usage
    const result = await dbStore.execute("SELECT *, event_start_time AT TIME ZONE 'UTC' AS event_start_time, event_end_time AT TIME ZONE 'UTC' AS event_end_time FROM user_events;");
    const data = await result;
    if (data && data[0].rows && data[0].rows.length > 0) {
      const firstRow = data[0].rows;
      const eventsList: Event[] = firstRow.map(parseEventRow); // Use the utility function
      setEvents(eventsList);
      updateFilteredEvents();
      
      const ongoingEvent = eventsList.find(event => event.endTime === null);
      
      if (ongoingEvent && (currentEvent === null || currentEvent === undefined)) {
        const ongoingEventUTC = {
            ...ongoingEvent,
            startTime: new Date(ongoingEvent.startTime),
            endTime: null,
          };
        setCurrentEvent(ongoingEventUTC);        // const startTimeWithOffset = new Date(new Date(ongoingEvent.startTime).getTime() - new Date(ongoingEvent.startTime).getTimezoneOffset() * 60000);
        // setActiveTime(Math.round((new Date().getTime() - startTimeWithOffset.getTime()) / 1000));
      }
    } else {
      console.log("No data available in rows.");    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export function updateFilteredEvents() {
    
  const { events, currentDate, dateMode, setFilteredEvents } = useAppStore.getState();

  let startDate: Date;
  let endDate: Date;

  if (dateMode === 'daily') {
    startDate = startOfDay(currentDate);
    endDate = endOfDay(currentDate);
  } else if (dateMode === 'weekly') {
    startDate = startOfWeek(currentDate);
    endDate = endOfWeek(currentDate);
  } else {
    startDate = startOfMonth(currentDate);
    endDate = endOfMonth(currentDate);
  }

  const filtered = events
    .filter((event) => {
    //   console.log("event", event);
    //   console.log("startDate", event.startTime,new Date(event.startTime),new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000),parseUTCToLocal(event.startTime));
      const eventStart = parseUTCToLocal(event.startTime);
      const eventEnd = event.endTime ? parseUTCToLocal(event.endTime) : null;
      return (
        eventStart >= startDate &&
        eventStart <= endDate &&
        eventEnd !== null
      );
    })
    .map((event) => ({
      ...event,
      startTime: parseUTCToLocal(event.startTime),
      endTime: event.endTime ? parseUTCToLocal(event.endTime) : null,
    }));

  setFilteredEvents(filtered);
  return filtered;
}

export function getStartAndEndDateForView() {
    const { currentDate, dateMode } = useAppStore.getState();
    if(dateMode==='daily') {
        return {
            startDate: startOfDay(currentDate),
            endDate: endOfDay(currentDate)
        }
    }
    else if (dateMode==='weekly') {
        return {
            startDate: startOfWeek(currentDate),
            endDate: endOfWeek(currentDate)
        }
    }  
    else {
        return {
            startDate: startOfMonth(currentDate),
            endDate: endOfMonth(currentDate)
        }
    }
}

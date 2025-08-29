import { addDays, endOfDay, endOfMonth } from "date-fns"
import { useDBStore } from '../../../postgres-db/stores';
import { Event } from '../types';
import useAppStore from "../../../components/state-utils/state-management";

export const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  export const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
  
    let result = '';
    if (hours > 0) {
      result += `${hours} hour${hours > 1 ? 's' : ''} `;
    }
    if (minutes > 0 || hours > 0) {
      result += `${minutes} minute${minutes !== 1 ? 's' : ''} `;
    }
    if (remainingSeconds > 0 || (hours === 0 && minutes === 0)) {
      result += `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
    }
    return result.trim();
  }
  
  export const formatDateTimeLocal = (date: Date): string => {
    return date.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(' ', 'T')
  }

  export const truncateText = (text: string,length: number) => {
    if (text && text.length > length) {
      return text.substring(0, length) + '...';
    }
  return text;
  }

  export const getEndDate = (date: Date | null, mode: 'daily' | 'weekly' | 'monthly'): Date | null => {
    switch (mode) {
      case 'daily':
        return endOfDay(date);
      case 'weekly':
        return endOfDay(addDays(date, 6));
      case 'monthly':
        return endOfDay(addDays(endOfMonth(date), 0));
    default:
        return date;
    }
  }

  export function stringToColor(str: string): string {
    const colors = [
      'bg-red-200', 'bg-pink-200', 'bg-purple-200', 'bg-indigo-200',
      'bg-blue-200', 'bg-cyan-200', 'bg-teal-200', 'bg-green-200',
      'bg-lime-200', 'bg-yellow-200', 'bg-amber-200', 'bg-orange-200',
      'bg-brown-200', 'bg-rose-200', 'bg-fuchsia-200', 'bg-violet-200',
      'bg-sky-200', 'bg-emerald-200', 'bg-slate-200', 'bg-red-300',
      'bg-pink-300', 'bg-purple-300', 'bg-indigo-300', 'bg-blue-300',
      'bg-cyan-300', 'bg-teal-300', 'bg-green-300', 'bg-lime-300',
      'bg-yellow-300', 'bg-amber-300', 'bg-orange-300', 'bg-brown-300',
      'bg-rose-300', 'bg-fuchsia-300', 'bg-violet-300', 'bg-sky-300',
      'bg-emerald-300', 'bg-slate-300', 'bg-red-400', 'bg-pink-400',
      'bg-purple-400', 'bg-indigo-400', 'bg-blue-400', 'bg-cyan-400',
      'bg-teal-400', 'bg-green-400', 'bg-lime-400', 'bg-yellow-400',
      'bg-amber-400', 'bg-orange-400', 'bg-rose-400', 'bg-fuchsia-400',
      'bg-violet-400', 'bg-sky-400', 'bg-emerald-400', 'bg-slate-400'
    ];
  
    // Generate a hash code from the string
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
  
    // Use the absolute value of the hash to select a color
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  export const parseEventRow = (row: any): Event => ({
    event_id: row.event_id,
    name: row.task_name,
    projectType: row.project_type,
    startTime: new Date(row.event_start_time.replace(/"/g, '')), // Ensure correct parsing
    endTime: row.event_end_time ? new Date(row.event_end_time.replace(/"/g, '')) : null
  });

  export const convertToUTCDate = (dateString: string): Date => {
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  };

  export const parseUTCToLocal = (utcDateString: string): Date => {
    return new Date(utcDateString);
  };

  export const convertFromUTCToLocal = (utcDateString: string): Date => {
    const date = new Date(utcDateString);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  };

export const handleEventInsert = async (event: Event) => {
  const clockedEvent = {
    taskDescription: event.name,
    projectType: event.projectType,
    startTime: event.startTime.toISOString(),
    endTime: event.endTime ? event.endTime.toISOString() : null,
    event_id: event.event_id,
    name: event.name
  };

  const insertStatement = `
    INSERT INTO user_events (event_id, project_type, task_name, event_start_time, event_end_time)
    VALUES (
      '${clockedEvent.event_id}',
      '${clockedEvent.projectType}',
      '${clockedEvent.taskDescription}',
      '${clockedEvent.startTime}',
      ${clockedEvent.endTime ? `'${clockedEvent.endTime}'` : 'NULL'}
    )
    ON CONFLICT (event_id) DO UPDATE SET
      event_end_time = EXCLUDED.event_end_time;
  `;

  console.log(insertStatement);

  const result = useDBStore.getState().execute(insertStatement);
  console.log("insert statement result", result);
};

export const handleEventUpdate = async (event: Event) => {
  const { updateEvent } = useAppStore.getState();

  const updatedEvent = {
    taskDescription: event.name,
    projectType: event.projectType,
    startTime: new Date(event.startTime),
    endTime: event.endTime ? new Date(event.endTime) : null,
    event_id: event.event_id,
    name: event.name
  };

  const updateStatement = `
    UPDATE user_events
    SET 
      project_type = '${updatedEvent.projectType}',
      task_name = '${updatedEvent.taskDescription}',
      event_start_time = '${updatedEvent.startTime.toISOString()}',
      event_end_time = ${updatedEvent.endTime ? `'${updatedEvent.endTime.toISOString()}'` : 'NULL'}
    WHERE event_id = '${updatedEvent.event_id}';
  `;

  console.log(updateStatement);

  const result = useDBStore.getState().execute(updateStatement);
  console.log("update statement result", result);

  updateEvent(event)
};

export const handleEventDelete = async (eventId: string) => {

  const { deleteEvent } = useAppStore.getState();

  const deleteStatement = `
    DELETE FROM user_events
    WHERE event_id = '${eventId}';
  `;

  console.log(deleteStatement);

  const result = useDBStore.getState().execute(deleteStatement);

  deleteEvent(eventId);
  console.log("delete statement result", result);
  
};
export interface Event {
    event_id: string
    name: string
    projectType: string
    startTime: Date
    endTime: Date | null
  }

  export const defaultProjectTypes = [
    "Office work",
    "Workout",
    "Personal Chores",
    "Break"
  ]

export interface CalendarViewProps {
    events: Event[];
    startDate: Date;
    endDate: Date;
    viewMode: 'daily' | 'weekly' | 'monthly';
    onViewChange: (newView: 'daily' | 'weekly' | 'monthly') => void;
} 
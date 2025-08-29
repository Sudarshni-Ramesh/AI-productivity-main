import create from 'zustand';
import { Event } from '../LockIn/types'; // Adjust the import paths as necessary
import { convertToUTCDate, convertFromUTCToLocal, handleEventInsert } from '../LockIn';
import { startOfDay, endOfDay, endOfWeek, endOfMonth, startOfWeek, startOfMonth } from 'date-fns'; // Assuming you're using date-fns for date manipulation
import { updateFilteredEvents } from './utils';

type ViewMode = 'eventView' | 'calendarView';
type DateMode = 'daily' | 'weekly' | 'monthly';

interface AppState {
  events: Event[];
  filteredEvents: Event[];
  currentEvent: Event | null;
  editingEvent: Event | null;
  projectTypes: string[];
  viewMode: ViewMode;
  dateMode: DateMode;
  projects: Record<string, any>[];
  currentDate: Date; // New state for current date
  updateEvent: (updatedEvent: Event) => void;
  deleteEvent: (eventId: string) => void;
  setEditingEvent: (event: Event | null) => void;
  addProjectType: (newType: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setDateMode: (mode: DateMode) => void;
  setProjects: (projects: Record<string, any>[]) => void;
  setEvents: (events: Event[]) => void;
  setFilteredEvents: (filtered_events: Event[]) => void;
  setCurrentEvent: (event: Event | null) => void;
  setCurrentDate: (date: Date) => void; // New function to set current date
  toggleEvent: (newEvent: Event | null) => void;
  isChatEnabled: boolean;
  toggleChatEnabled: () => void;
  dataVersion: number;
  incrementDataVersion: () => void;
}

function transformEventToUTC(updatedEvent: Event): Event {
  return {
    ...updatedEvent,
    startTime: convertToUTCDate(updatedEvent.startTime), // Convert startTime to UTC
    endTime: updatedEvent.endTime ? convertToUTCDate(updatedEvent.endTime) : null // Convert endTime to UTC if not null
  };
}
const useAppStore = create<AppState>((set, get) => ({
  events: [],
  filteredEvents: [],
  currentEvent: null,
  editingEvent: null,
  projectTypes: [],
  viewMode: 'eventView',
  dateMode: 'monthly',
  projects: [],
  currentDate: new Date(), // Initialize with today's date

  setEvents: (events) => set({ events }),

  setFilteredEvents: (filtered_events) => set({ filteredEvents: filtered_events }),

  setCurrentEvent: (event) => set({ currentEvent: event }),

  setCurrentDate: (date) => set({ currentDate: date }), // Function to update currentDate

  updateEvent: (updatedEvent) => set((state) => {
    console.log("updateEvent", updatedEvent);
    const transformedUpdatedEvent = transformEventToUTC(updatedEvent);
    const updatedEvents = state.events.map(event =>
      event.event_id === updatedEvent.event_id ? { ...event, ...updatedEvent } : event
    );

    // Update the events in the state
    set({ events: updatedEvents, editingEvent: null });

    // Call updateFilteredEvents to refresh the filtered events
    updateFilteredEvents();

    return {
      events: updatedEvents,
      editingEvent: null,
    };
  }),

  setProjects: (projects) => {
    set({ projects });
  },
  
  deleteEvent: (eventId) => set((state) => {
    const updatedEvents = state.events.filter(event => event.event_id !== eventId);
    
    // Update the events in the state
    set({ events: updatedEvents, editingEvent: null });

    // Call updateFilteredEvents to refresh the filtered events
    updateFilteredEvents();

    return {
      events: updatedEvents,
      editingEvent: null,
    };
  }),

  setEditingEvent: (event) => set({ editingEvent: event }),

  addProjectType: (newType) => set((state) => ({
    projectTypes: state.projectTypes.includes(newType) ? state.projectTypes : [...state.projectTypes, newType],
  })),

  setViewMode: (mode) => set({ viewMode: mode }),

  setDateMode: (mode) => set({ dateMode: mode }),
  
  toggleEvent: (newEvent: Event | null) => {
    console.log("toggleEvent", newEvent);
    const { currentEvent, events, setEvents, setCurrentEvent } = get();

    if (currentEvent) {
      const completedEvent: Event = {
        ...currentEvent,
        endTime: new Date(),
      };
      setEvents([...events, completedEvent]);
      updateFilteredEvents();
      handleEventInsert(completedEvent);
      setCurrentEvent(null);
    } else if (newEvent) {
      setCurrentEvent(newEvent);
      handleEventInsert(newEvent);

    }
  },

  isChatEnabled: false,
  toggleChatEnabled: () => set((state) => ({ isChatEnabled: !state.isChatEnabled })),
  dataVersion: 0,
  incrementDataVersion: () => set((state) => ({ dataVersion: state.dataVersion + 1 })),
}));

export default useAppStore;

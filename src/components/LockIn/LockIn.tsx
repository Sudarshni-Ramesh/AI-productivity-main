// src/features/lockin/LockIn.tsx
import React, { useState, useEffect, useMemo } from 'react'
import EventForm from './components/EventForm'
import EventList from './components/EventList'
import CalendarView from './components/CalendarView'
import EditEventModal from './components/EditEventModal'
import LLMSearch from '../../components/LLMSearch'
import { Event, defaultProjectTypes } from './types'
// import { insertOrUpdateEventData, deleteEventData, listenToFirestoreCollection } from './utils/firestoreUtils'
import DateModeSelector from './components/DateModeSelector'
import { endOfDay, endOfMonth, startOfDay, startOfMonth } from 'date-fns'
import { useDBStore } from '../../postgres-db/stores';
import { parseEventRow } from './utils'
import { parseISO, getTime } from 'date-fns';
import { handleEventInsert, handleEventUpdate, handleEventDelete, convertToUTCDate } from './utils'; // Import the utility function
import { convertFromUTCToLocal } from './utils'; // Import the utility function
import useAppStore from '../state-utils/state-management'
import { fetchAndSetEvents } from '../state-utils/utils'; // Import the utility function

// Add these new types
type SelectorProps = {
  startDate: Date;
  endDate: Date;
  viewMode: ViewMode;
  dateMode: DateMode;
};

type DateMode = 'daily' | 'weekly' | 'monthly';
type ViewMode = 'eventView' | 'calendarView';

const LockIn = () => {

  const {
    events,
    currentEvent,
    editingEvent,
    viewMode,
    setEditingEvent,
    setViewMode,
    setDateMode,
    dataVersion,
  } = useAppStore();
  
  useEffect(() => {
    fetchAndSetEvents();
  }, []);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events))
  }, [events])

  useEffect(() => {
    fetchAndSetEvents();
  }, [dataVersion]);
  // console.log("viewMode", viewMode);

  return (
    <div className="max-w-6xl mx-auto p-4 relative">
      <div className="flex flex-col items-center mb-2"> {/* Reduced mb-4 to mb-2 */}
        <DateModeSelector/>
      </div>
      <div className="flex">
        <div className="flex-grow">
        {viewMode === 'eventView' ? <EventForm/> : null }
          <div className="mb-16"> {/* Add margin-bottom to prevent overlap */}
            {viewMode === 'eventView' ? (
              <EventList/>
            ) : (
              <CalendarView/>
            )}
            {/* <EventList events={filteredEvents} onEditEvent={editEvent} /> */}
          </div>
          {editingEvent && (
            <EditEventModal/>
          )}
        </div>
      </div>
      {/* <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4 bg-gray-100 z-10">
        <div className="w-full max-w-3xl">
          <LLMSearch />
        </div>
      </div> */}
    </div>
  )
}

export default LockIn

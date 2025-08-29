import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Event } from '../types'
import { convertToUTCDate, formatDateTimeLocal, handleEventDelete, handleEventUpdate } from '../utils'
import useAppStore from '../../state-utils/state-management'
// interface EditEventModalProps {
//   event: Event
//   projectTypes: string[]
//   onUpdate: (updatedEvent: Event) => void
//   onDelete: (eventId: number) => void
//   onClose: () => void
// }

const EditEventModal: React.FC = () => {
  const { editingEvent, projectTypes, updateEvent, setEditingEvent } = useAppStore();
  const [editedEvent, setEditedEvent] = useState(editingEvent)
  const [editError, setEditError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditedEvent({ ...editedEvent, [name]: value })
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const newDate = new Date(value)
    setEditedEvent({ ...editedEvent, [name]: newDate.toISOString() })

    if (name === 'startTime' && new Date(value) >= new Date(editedEvent.endTime!)) {
      setEditError("Start time must be before end time.")
    } else if (name === 'endTime' && new Date(editedEvent.startTime) >= new Date(value)) {
      setEditError("Start time must be before end time.")
    } else {
      setEditError(null)
    }
  }

  const handleSubmit = () => {
    console.log("editedEvent", editedEvent);
    if (!editError && editedEvent) {
      handleEventUpdate(editedEvent)
      updateEvent(editedEvent)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-4 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Edit Event</h3>
        <select
          name="projectType"
          value={editedEvent.projectType}
          onChange={handleInputChange}
          className="w-full p-2 border rounded mb-2"
        >
          <option value="">Select project type</option>
          {projectTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input
          type="text"
          name="name"
          value={editedEvent.name}
          onChange={handleInputChange}
          className="w-full p-2 border rounded mb-2"
          placeholder="What you're working on? (optional)"
        />
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input
            type="datetime-local"
            name="startTime"
            value={formatDateTimeLocal(new Date(editedEvent.startTime))}
            onChange={handleDateChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input
            type="datetime-local"
            name="endTime"
            value={formatDateTimeLocal(new Date(editedEvent.endTime!))}
            onChange={handleDateChange}
            className="w-full p-2 border rounded"
          />
        </div>
        {editError && (
          <div className="text-red-500 text-sm mb-4">{editError}</div>
        )}
        <div className="flex justify-between items-center">
          <button
            onClick={() => handleEventDelete(editedEvent.event_id)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
          <div className="flex space-x-2">
            <button 
              onClick={() => setEditingEvent(null)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className={`px-4 py-2 rounded ${
                editError
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 transition-colors'
              }`}
              disabled={!!editError}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditEventModal
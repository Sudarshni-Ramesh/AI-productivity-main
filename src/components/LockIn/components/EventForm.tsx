import React, { useEffect, useState } from 'react'
import { Play, Square } from 'lucide-react'
import { Event } from '../types'
import { formatTime } from '../utils'
import { v4 as uuidv4 } from 'uuid';
import useAppStore from '../../state-utils/state-management'
import { fetchProjectsAndTasks } from '../../TaskManagement/utils';

const EventForm: React.FC = () => {
  const {
    currentEvent,
    toggleEvent,
    projects
  } = useAppStore();

  const [chosenProject, setChosenProject] = useState('Miscellaneous project')
  const [chosenTask, setChosenTask] = useState('')
  const [activeTime, setActiveTime] = useState(0)

  // console.log("chosenProject:", chosenProject);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentEvent) {
      const startTime = currentEvent.startTime ? new Date(currentEvent.startTime).getTime() : 0;
      const now = new Date().getTime();
      const initialActiveTime = startTime ? Math.floor((now - startTime) / 1000) : 0;
      setActiveTime(initialActiveTime);

      interval = setInterval(() => {
        setActiveTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      setActiveTime(0);
    }
    return () => clearInterval(interval);
  }, [currentEvent]);

  useEffect(() => {
    if (currentEvent) {
      const projectId = projects.find(p => p.project_name === currentEvent.projectType)?.project_id || 'Miscellaneous project';
      setChosenProject(projectId);
      setChosenTask(currentEvent.name);
    }
  }, [currentEvent, projects]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchProjectsAndTasks();

      } catch (error) {
        console.error("Error fetching projects and tasks:", error);
      }
    };

    fetchData();
  }, []);


  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setChosenProject(value)
    setChosenTask('')
  }

  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChosenTask(e.target.value)
  }

  const handleToggleEvent = async () => {
    if (!currentEvent) {
      const selectedProject = projects.find(p => p.project_id === chosenProject);
      const projectName = selectedProject ? selectedProject.project_name : 'Miscellaneous project';
      
      const newEvent: Event = {
        event_id: uuidv4(),
        name: chosenTask || 'Untitled Task',
        projectType: projectName,
        startTime: new Date(),
        endTime: null,
      }
      toggleEvent(newEvent)
    } else {
      toggleEvent(null)
    }
  }

  return (
    <div className="mb-4 bg-white shadow-md rounded-lg p-4">
      <div className="flex items-center space-x-4">
        <div className="w-1/2">
          <select
            value={chosenProject}
            onChange={handleProjectChange}
            className="w-full p-2 border rounded-md text-lg"
          >
            <option value="Miscellaneous project">Miscellaneous project</option>
            {projects.map((project) => (
              <option key={project.project_id} value={project.project_id}>{project.project_name}</option>
            ))}
          </select>
        </div>
        <div className="w-1/2">
          <input
            list="tasks"
            value={chosenTask}
            onChange={handleTaskChange}
            placeholder="Select or type task (optional)"
            className="w-full p-2 border rounded-md text-lg"
            disabled={!!currentEvent}
          />
          <datalist id="tasks">
            {projects
              .find(p => p.project_id === chosenProject)?.tasks
              .map((task) => (
                <option key={task.task_name} value={task.task_name} />
              ))}
          </datalist>
        </div>
        <button
          onClick={handleToggleEvent}
          className={`px-6 py-2 rounded-md text-lg flex items-center justify-center ${
            currentEvent
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-green-500 text-white hover:bg-green-600'
          } transition-colors`}
        >
          {currentEvent ? (
            <>
              <Square className="w-6 h-6 mr-2" />
              Stop ({formatTime(activeTime)})
            </>
          ) : (
            <>
              <Play className="w-6 h-6 mr-2" />
              Start
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default EventForm

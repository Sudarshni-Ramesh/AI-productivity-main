import React, { useState } from 'react';
import { Tag, Plus, Check, X, AlertCircle, Clock, Edit, Coffee, Zap, Dumbbell, Brain, FolderPlus } from 'lucide-react';
import { handleProjectDelete, handleProjectInsert, handleTaskDelete, handleTaskInsert } from './utils';
import { v4 as uuidv4 } from 'uuid';
import useAppStore from '../state-utils/state-management';

interface Task {
  id: string;
  task_name: string; // Changed from 'name' to 'task_name'
  status: 'Not Started' | 'In Progress' | 'Blocked' | 'Done';
  effort: 'coffee break' | 'easy' | 'medium' | 'hard';
  [key: string]: any; // Allow additional fields
}

interface Project {
  id: string;
  project_name: string; // Changed from 'name' to 'project_name'
  project_status: 'Not Started' | 'In Progress' | 'Done';
  tasks: Task[];
  [key: string]: any; // Allow additional fields
}

interface NewTask {
  task_name: string; // Changed from 'name' to 'task_name'
  effort: 'coffee break' | 'easy' | 'medium' | 'hard';
  task_status: 'Not Started' | 'In Progress' | 'Blocked' | 'Done'; // Added task_status
}

// Update the EditTask interface
interface EditTask {
  id: string;
  task_name: string;
  effort: 'coffee break' | 'easy' | 'medium' | 'hard';
  task_status: 'Not Started' | 'In Progress' | 'Blocked' | 'Done'; // Changed from 'status' to 'task_status'
  project_id: string;
}

const TaskManagementUI = ({ projects }: { projects: Project[] }) => { // Accept projects as a prop
  const [newProjectName, setNewProjectName] = useState('');
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<NewTask>({ task_name: '', effort: 'easy', task_status: 'Not Started' }); // Updated to include task_status
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<EditTask>({ 
    id: '', 
    task_name: '', 
    effort: 'easy', 
    task_status: 'Not Started', // Changed from 'status' to 'task_status'
    project_id: ''
  });
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project>({ id: '', project_name: '', project_status: 'Not Started', tasks: [] }); // Changed from 'name' to 'project_name'
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);

  const projectStatusOptions = ['Not Started', 'In Progress', 'Done'];

  const effortOptions = [
    { value: 'coffee break', label: 'Coffee Break', icon: Coffee },
    { value: 'easy', label: 'Easy', icon: Zap },
    { value: 'medium', label: 'Medium', icon: Dumbbell },
    { value: 'hard', label: 'Hard', icon: Brain },
  ];

  const taskStatusOptions = ['Not Started', 'In Progress', 'Blocked', 'Done'];

  // Collect all unique additional fields from projects and tasks, excluding 'task_name'
  const additionalProjectFields = Array.from(new Set(projects.flatMap(project => Object.keys(project).filter(key => !['id', 'project_name', 'tasks','project_id'].includes(key)))));
  const additionalTaskFields = Array.from(new Set(projects.flatMap(project => 
    project.tasks.flatMap(task => 
      Object.keys(task).filter(key => !['id', 'task_name', 'task_status', 'effort', 'project_id','task_id'].includes(key))
    )
  )));

  console.log("additionalProjectFields", additionalProjectFields);
  console.log("additionalTaskFields", additionalTaskFields);
  console.log("project.tasks", projects);

  const { incrementDataVersion } = useAppStore();

  // Calculate the total number of columns
  const totalColumns = 6 + additionalProjectFields.length + additionalTaskFields.length; // Adjust the base number as needed

  const openAddProjectModal = () => {
    setIsAddProjectModalOpen(true);
    setNewProjectName('');
  };

  const closeAddProjectModal = () => {
    setIsAddProjectModalOpen(false);
    setNewProjectName('');
  };

  const addProject = () => {
    if (newProjectName.trim()) {
      const newProject = {
        project_id: uuidv4(),
        project_name: newProjectName.trim(), // Changed from 'name' to 'project_name'
      };
  
      handleProjectInsert(newProject);
      // Assuming you have a way to update the projects externally
      // updateProjects([...projects, newProject]);
      closeAddProjectModal();
    }
  };

  const openAddTaskModal = (projectId: string) => {
    setActiveProjectId(projectId);
    setIsModalOpen(true);
    setNewTask({ task_name: '', effort: 'easy', task_status: 'Not Started' });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewTask({ task_name: '', effort: 'easy', task_status: 'Not Started' });
    // Don't reset activeProjectId here
  };

  const addTask = () => {
    console.log("addTask", activeProjectId, newTask);
    if (activeProjectId && newTask.task_name.trim()) {
      const taskToInsert = {
        ...newTask,
        task_id: uuidv4(),
        project_id: activeProjectId,
        // Use task_status instead of status
        task_status: newTask.task_status,
      };
      console.log("adding task", taskToInsert);
      handleTaskInsert(taskToInsert);
      
      // Update the local state to reflect the new task
      const updatedProjects = projects.map(project => {
        if (project.id === activeProjectId) {
          return {
            ...project,
            tasks: [...project.tasks, taskToInsert],
          };
        }
        return project;
      });
      
      // Update the projects state
      // Implement this function to update your global state
      // updateProjects(updatedProjects);
      
      // Close the modal but don't reset activeProjectId
      setIsModalOpen(false);
      setNewTask({ task_name: '', effort: 'easy', task_status: 'Not Started' });
      incrementDataVersion();
    }
  };

  const getProjectStatus = (tasks: Task[]): Task['status'] => {
    if (tasks.length === 0) return 'Not Started';
    if (tasks.every(task => task.task_status === 'Done')) return 'Done';
    if (tasks.some(task => task.task_status === 'In Progress')) return 'In Progress';
    return 'Not Started';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Not Started': return <Clock className="w-5 h-5 text-gray-500" />;
      case 'In Progress': return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'Blocked': return <X className="w-5 h-5 text-red-500" />;
      case 'Done': return <Check className="w-5 h-5 text-green-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Not Started': return 'bg-gray-200';
      case 'In Progress': return 'bg-blue-200';
      case 'Blocked': return 'bg-red-200';
      case 'Done': return 'bg-green-200';
      default: return '';
    }
  };

  const getEffortIcon = (effort: Task['effort']) => {
    switch (effort) {
      case 'coffee break': return <Coffee className="w-4 h-4 text-green-500" />;
      case 'easy': return <Zap className="w-4 h-4 text-blue-500" />;
      case 'medium': return <Dumbbell className="w-4 h-4 text-yellow-500" />;
      case 'hard': return <Brain className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getEffortColor = (effort: Task['effort']) => {
    switch (effort) {
      case 'coffee break': return 'bg-green-100 text-green-800';
      case 'easy': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return '';
    }
  };

  const openEditTaskModal = (task: Task, projectId: string) => {
    setEditTask({ 
      id: task.id,
      task_name: task.task_name,
      effort: task.effort,
      task_status: task.task_status, // Ensure task_status is set
      project_id: projectId
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditTask({ id: '', task_name: '', effort: 'easy', task_status: 'Not Started', project_id: '' }); // Changed from 'name' to 'task_name'
  };

  const updateTask = () => {
    if (editTask.id && editTask.project_id) {
      const taskToUpdate = {
        task_id: editTask.id,
        project_id: editTask.project_id,
        task_name: editTask.task_name,
        task_status: editTask.task_status, // Use task_status here
        effort: editTask.effort,
        // Include any other fields that are part of your task structure
      };

      console.log("Updating task:", taskToUpdate);
      handleTaskInsert(taskToUpdate);
      closeEditModal();
      incrementDataVersion();
    } else {
      console.error("Cannot update task: missing id or project_id", editTask);
    }
  };

  const openEditProjectModal = (project: Project) => {
    setEditProject({ ...project });
    setIsEditProjectModalOpen(true);
  };

  const closeEditProjectModal = () => {
    setIsEditProjectModalOpen(false);
    setEditProject({ id: '', project_name: '', project_status: 'Not Started', tasks: [] });
  };

  const updateProject = () => {
    if (editProject.id) {
      // Assuming you have a way to update the projects externally
      // updateProjects(projects.map(project =>
      //   project.id === editProject.id ? { ...project, ...editProject } : project
      // ));
      handleProjectInsert(editProject);
      closeEditProjectModal();
      incrementDataVersion();
    }
  };

  const deleteProject = () => {
    if (editProject.id) {
      if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        // Assuming you have a way to update the projects externally
        // updateProjects(projects.filter(project => project.id !== editProject.id));
        handleProjectDelete(editProject.project_id);
        closeEditProjectModal();
        incrementDataVersion();
      }
    }
  };

  const deleteTask = async () => {
    if (editTask.id) {
      if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
        await handleTaskDelete(editTask.id);
        closeEditModal();
        incrementDataVersion();
      }
    }
  };

  const handleEditTaskChange = (key: keyof EditTask, value: any) => {
    setEditTask({ ...editTask, [key]: value });
  };

  const handleEditProjectChange = (key: string, value: any) => {
    setEditProject({ ...editProject, [key]: value });
  };

  // console.log("projects:", projects);
  return (
    <div className="container mx-auto p-4 relative">
      {/* <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Projects</h2>
      </div> */}
      <div className="overflow-x-auto relative z-0">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {/* Add headers for additional project fields */}
              {additionalProjectFields.map((field) => (
                <th key={field} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{field}</th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effort</th>
              {/* Add headers for additional task fields */}
              {additionalTaskFields.map((field) => (
                <th key={field} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{field}</th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project) => (
              project.tasks.length > 0 ? (
                // Existing code for projects with tasks
                project.tasks.map((task, index) => (
                  <tr key={task.task_id}>
                    {index === 0 && (
                      <>
                        <td className="px-4 py-4 whitespace-nowrap" rowSpan={project.tasks.length}>
                          <div className="text-sm font-medium text-gray-900">{project.project_name}</div> {/* Changed from 'name' to 'project_name' */}
                          <div className="mt-2 space-y-1">
                            <button 
                              onClick={() => openEditProjectModal(project)}
                              className="flex items-center text-indigo-600 hover:text-indigo-900 transition-colors duration-200 ease-in-out"
                            >
                              <Edit className="w-5 h-5 mr-2" />
                              <span className="text-sm">Edit Project</span>
                            </button>
                            <button 
                              onClick={() => openAddTaskModal(project.id)}
                              className="flex items-center text-indigo-600 hover:text-indigo-900 transition-colors duration-200 ease-in-out"
                            >
                              <Plus className="w-5 h-5 mr-2" />
                              <span className="text-sm">Add Task</span>
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap" rowSpan={project.tasks.length}>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(getProjectStatus(project.tasks))}`}>
                            {getProjectStatus(project.tasks)}
                          </span>
                        </td>
                        {/* Render additional project fields */}
                        {additionalProjectFields.map((field) => (
                          <td key={field} className="px-4 py-4 whitespace-nowrap" rowSpan={project.tasks.length}>
                            <div className="text-sm text-gray-500">{project[field] || '-'}</div>
                          </td>
                        ))}
                      </>
                    )}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{task.task_name}</div> {/* Render task_name */}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.task_status)}`}>
                        {task.task_status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getEffortColor(task.effort)}`}>
                        {getEffortIcon(task.effort)}
                        <span className="ml-1">{task.effort}</span>
                      </span>
                    </td>
                    {/* Render additional task fields, excluding task_name */}
                    {additionalTaskFields.map((field) => (
                      <td key={field} className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{task[field] || '-'}</div>
                      </td>
                    ))}
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => openEditTaskModal(task, project.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                // Updated code for projects with empty task arrays
                <tr key={project.id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{project.project_name}</div>
                    <div className="mt-2 space-y-1">
                      <button 
                        onClick={() => openEditProjectModal(project)}
                        className="flex items-center text-indigo-600 hover:text-indigo-900 transition-colors duration-200 ease-in-out"
                      >
                        <Edit className="w-5 h-5 mr-2" />
                        <span className="text-sm">Edit Project</span>
                      </button>
                      <button 
                        onClick={() => openAddTaskModal(project.id)}
                        className="flex items-center text-indigo-600 hover:text-indigo-900 transition-colors duration-200 ease-in-out"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        <span className="text-sm">Add Task</span>
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor('Not Started')}`}>
                      Not Started
                    </span>
                  </td>
                  {/* Render additional project fields */}
                  {additionalProjectFields.map((field) => (
                    <td key={field} className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{project[field] || '-'}</div>
                    </td>
                  ))}
                  <td colSpan={4 + additionalTaskFields.length} className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-500">No tasks added</span>
                  </td>
                </tr>
              )
            ))}
            {/* Add Project Section */}
            <tr>
              <td colSpan={totalColumns} className="px-4 py-4 whitespace-nowrap text-center">
                <div 
                  onClick={openAddProjectModal}
                  className="group flex justify-center items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-lg cursor-pointer transition-all duration-200 ease-in-out w-full"
                >
                  <Plus className="w-6 h-6 mr-2" />
                  <span className="text-lg hidden group-hover:inline">Add New Project</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add Project Modal */}
      {isAddProjectModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Project</h3>
              <div className="mt-2 space-y-4">
                <div>
                  <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    id="projectName"
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Enter project name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <button 
                    onClick={closeAddProjectModal}
                    className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={addProject}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Add Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Task</h3>
              <div className="mt-2 space-y-4">
                <div>
                  <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                  <input
                    id="taskName"
                    type="text"
                    value={newTask.task_name} // Changed from 'name' to 'task_name'
                    onChange={(e) => setNewTask({ ...newTask, task_name: e.target.value })} // Changed from 'name' to 'task_name'
                    placeholder="Enter task name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Effort</label>
                  <div className="grid grid-cols-2 gap-2">
                    {effortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setNewTask({ ...newTask, effort: option.value as Task['effort'] })}
                        className={`flex items-center justify-center px-4 py-2 border rounded-md ${newTask.effort === option.value ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                      >
                        <option.icon className="w-5 h-5 mr-2" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <button 
                    onClick={closeModal}
                    className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={addTask}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Task</h3>
              <div className="mt-2 space-y-4">
                <div>
                  <label htmlFor="task_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Task Name
                  </label>
                  <input
                    id="task_name"
                    type="text"
                    value={editTask.task_name || ''}
                    onChange={(e) => handleEditTaskChange('task_name', e.target.value)}
                    placeholder="Enter task name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="task_status" className="block text-sm font-medium text-gray-700 mb-1">
                    Task Status
                  </label>
                  <select
                    id="task_status"
                    value={editTask.task_status}
                    onChange={(e) => handleEditTaskChange('task_status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {taskStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Effort</label>
                  <div className="grid grid-cols-2 gap-2">
                    {effortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleEditTaskChange('effort', option.value)}
                        className={`flex items-center justify-center px-4 py-2 border rounded-md ${
                          editTask.effort === option.value ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'
                        }`}
                      >
                        <option.icon className="w-5 h-5 mr-2" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between space-x-3 mt-4">
                  <button 
                    onClick={deleteTask}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Delete Task
                  </button>
                  <div className="flex space-x-3">
                    <button 
                      onClick={closeEditModal}
                      className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={updateTask}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Update Task
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditProjectModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Project</h3>
              <div className="mt-2 space-y-4">
                <div>
                  <label htmlFor="project_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    id="project_name"
                    type="text"
                    value={editProject.project_name || ''}
                    onChange={(e) => handleEditProjectChange('project_name', e.target.value)}
                    placeholder="Enter project name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="project_status" className="block text-sm font-medium text-gray-700 mb-1">
                    Project Status
                  </label>
                  <select
                    id="project_status"
                    value={editProject.project_status || ''}
                    onChange={(e) => handleEditProjectChange('project_status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {projectStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Add other project fields here if needed */}
                <div className="flex justify-between space-x-3 mt-4">
                  <button 
                    onClick={deleteProject}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Delete Project
                  </button>
                  <div className="flex space-x-3">
                    <button 
                      onClick={closeEditProjectModal}
                      className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={updateProject}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Update Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      

      {/* Floating Action Button for Adding Project */}
      {/* <button 
        onClick={openAddProjectModal}
        className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110"
      >
        <Plus size={24} />
      </button> */}
    </div>
  );
};

export default TaskManagementUI;
// src/components/TaskManagement/TaskManagement.tsx
import React, { useState, useEffect } from 'react';
import TaskManagementUI from './TaskManagementUI';
import { fetchProjectsAndTasks } from './utils';
import useAppStore from '../state-utils/state-management';

const TaskManagement = () => {
  // console.log("TaskManagement: ",TaskManagement);

  const { projects, setProjects, dataVersion } = useAppStore();

  const fetchData = async () => {
    try {
      await fetchProjectsAndTasks();
    } catch (error) {
      console.error("Error fetching projects and tasks:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [dataVersion]);

  // console.log("projects", projects);

  return (
    <TaskManagementUI projects={projects} />
  );
};

export default TaskManagement;

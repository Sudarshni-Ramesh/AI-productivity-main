import { useDBStore } from "../../postgres-db/stores";
import useAppStore from "../state-utils/state-management";

export const handleProjectInsert = async (project: Record<string, any>) => {
    // Filter out the 'tasks' field from the project object
    const projectWithoutTasks = Object.entries(project).reduce((acc, [key, value]) => {
        if (key !== 'tasks' && key!=='id') {
            acc[key] = value;
        }
        return acc;
    }, {} as Record<string, any>);

    const columns = Object.keys(projectWithoutTasks).join(', ');
    const values = Object.values(projectWithoutTasks)
        .map(value => (value !== null ? `'${value}'` : 'NULL'))
        .join(', ');
  
    const insertStatement = `
        INSERT INTO projects (${columns})
        VALUES (${values})
        ON CONFLICT (project_id) DO UPDATE SET
            ${Object.keys(projectWithoutTasks)
                .map(key => `${key} = '${projectWithoutTasks[key]}'`)
                .join(', ')};
    `;
  
    console.log(insertStatement);
  
    const result = useDBStore.getState().execute(insertStatement);
    console.log("insert statement result", result);
};

export const handleTaskInsert = async (task: Record<string, any>) => {
    const columns = Object.keys(task).join(', ');
    const values = Object.values(task)
      .map(value => (value !== null ? `'${value}'` : 'NULL'))
      .join(', ');
  
    const insertStatement = `
      INSERT INTO tasks (${columns})
      VALUES (${values})
      ON CONFLICT (task_id) DO UPDATE SET
        ${Object.keys(task)
          .map(key => `${key} = '${task[key]}'`)
          .join(', ')};
    `;
  
    console.log(insertStatement);
  
    const result = useDBStore.getState().execute(insertStatement);
    console.log("insert statement result", result);
};

export const handleProjectDelete = async (project_id: string) => {
  const deleteStatement = `
    DELETE FROM projects
    WHERE project_id = '${project_id}';
  `;

  console.log(deleteStatement);

  try {
    const result = await useDBStore.getState().execute(deleteStatement);
    console.log("Delete project result:", result);
    return result;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

export const handleTaskDelete = async (task_id: string) => {
  const deleteStatement = `
    DELETE FROM tasks
    WHERE task_id = '${task_id}';
  `;

  console.log(deleteStatement);

  try {
    const result = await useDBStore.getState().execute(deleteStatement);
    console.log("Delete task result:", result);
    return result;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

export const fetchProjectsAndTasks = async () => {

    const project_query = `
    SELECT *
    FROM 
    projects;
    `;

    const task_query = `
    SELECT 
    *
    FROM 
    tasks;
    `;

  try {
    const { setProjects } = useAppStore.getState();

    const project_result = await useDBStore.getState().execute(project_query);
    const task_result = await useDBStore.getState().execute(task_query);
    // console.log("project_result",project_result);
    // console.log("task_result",task_result);
    const result = consolidateTasksAndProjects(project_result[0].rows, task_result[0].rows);
    // console.log("Resultt:",result);
    if(result) {
      setProjects(result);
    }
  } catch (error) {
    console.error("Error fetching projects and tasks:", error);
    throw error;
  }
};



const consolidateTasksAndProjects = (projects: any[], tasks: any[]): any[] => {
//   console.log("-----------------------------------");
//   console.log("projects", projects);
//   console.log("tasks", tasks);

  const projectMap: { [key: string]: any } = {};

  // Loop through the projects and create an entry for each project
  projects.forEach((project) => {
    projectMap[project.project_id] = {
      id: project.project_id.toString(),
      project_id: project.project_id.toString(),
      project_name: project.project_name,
      tasks: [],
      // Add any other project fields here
    };
  });

  // Loop through the tasks and add them to the corresponding project based on project_id
  tasks.forEach((task) => {
    const projectId = task.project_id;

    if (projectMap[projectId]) {
      const taskObject = Object.entries(task).reduce((acc, [key, value]) => {
        if (key !== 'project_id') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      projectMap[projectId].tasks.push(taskObject);
    }
  });

//   console.log("projectMap", Object.values(projectMap));
//   console.log("-----------------------------------");

  // Convert the projectMap object back to an array
  return Object.values(projectMap);
};
  

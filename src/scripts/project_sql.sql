CREATE TABLE user_events (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL,
    project_type VARCHAR(255) NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    event_start_time TIMESTAMP NOT NULL,
    event_end_time TIMESTAMP
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    project_status VARCHAR(50) NULL,
);


CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    task_id VARCHAR(255) NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    task_status VARCHAR(50) NOT NULL DEFAULT 'Not Started',
    project_id VARCHAR(255) NOT NULL,
    effort VARCHAR(50) NOT NULL
);

ALTER TABLE user_events
ADD CONSTRAINT unique_event_id UNIQUE (event_id);

ALTER TABLE projects
ADD CONSTRAINT unique_project_id UNIQUE (project_id);


ALTER TABLE tasks
ADD CONSTRAINT unique_task_id UNIQUE (task_id);    

CREATE TABLE graphs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    data_query TEXT NOT NULL,
    dataset_label VARCHAR(255),
    background_colors TEXT[] DEFAULT ARRAY[
        '#FF6384', '#36A2EB', '#FFCE56', 
        '#4BC0C0', '#9966FF', '#FF9F40'
    ],
    hover_background_colors TEXT[],
    should_display BOOLEAN DEFAULT true, -- to indicate if the graph should be displayed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

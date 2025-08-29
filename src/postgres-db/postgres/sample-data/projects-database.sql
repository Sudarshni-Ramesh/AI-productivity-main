CREATE TABLE user_events (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(255) NOT NULL,
    project_type VARCHAR(255) NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    event_start_time TIMESTAMP NOT NULL,
    event_end_time TIMESTAMP
);

CREATE TABLE project_details (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    project_status VARCHAR(50) NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    task_status VARCHAR(50) NOT NULL,
    effort VARCHAR(50) NOT NULL
);

ALTER TABLE user_events
ADD CONSTRAINT unique_event_id UNIQUE (event_id);

ALTER TABLE project_details
ADD CONSTRAINT unique_project_id UNIQUE (project_id);

INSERT INTO user_events (event_id, project_type, task_name, event_start_time, event_end_time) VALUES
('1', 'Development', 'Implement Login Feature', TIMESTAMP '2024-10-09 09:00:00', TIMESTAMP '2024-10-09 11:00:00'),
('2', 'Design', 'Create Wireframes', TIMESTAMP '2024-10-09 11:30:00', TIMESTAMP '2024-10-09 13:00:00'),
('3', 'Testing', 'Run Unit Tests', TIMESTAMP '2024-10-09 14:00:00', TIMESTAMP '2024-10-09 15:30:00'),
('4', 'Deployment', 'Deploy to Production', TIMESTAMP '2024-10-09 16:00:00', TIMESTAMP '2024-10-09 17:00:00'),
('5', 'Deployment', 'Deploy to Development', TIMESTAMP '2024-10-09 16:00:00', TIMESTAMP '2024-10-09 17:00:00');

INSERT INTO project_details (project_id, project_name, project_status, task_name, task_status, effort) VALUES
('1', 'Project Alpha', 'In Progress', 'Design UI', 'Completed', '2 hours'),
('2', 'Project Beta', 'Completed', 'Implement Login', 'Completed', '3 hours'),
('3', 'Project Gamma', 'In Progress', 'Test Cases', 'In Progress', '4 hours'),
('4', 'Project Delta', 'Pending', 'Deploy Application', 'Pending', '5 hours');
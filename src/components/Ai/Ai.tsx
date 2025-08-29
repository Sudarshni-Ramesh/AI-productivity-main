import { generateText, OpenAIStream, tool } from 'ai'
import { ToolInvocation, convertToCoreMessages, streamText, Message } from 'ai'
import { convertToCoreTools, maxMessageContext, tools } from './tools'
import { StreamingTextResponse } from 'ai'
import { CoreTool } from 'ai'
import { OPENAI_API_KEY } from '../../../cred-config'
import OpenAI from 'openai';
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod';
import { codeBlock } from 'common-tags'
import { executeQuery, getRecordsFromTable } from '../../postgres-proxy/utils'
import useAppStore from '../state-utils/state-management'
import { updateLastSteps } from './utils'

const chatModel = 'gpt-3.5-turbo'

// const openai = new OpenAI({
//   apiKey: OPENAI_API_KEY,
//   baseURL: 'https://api.openai.com/v1',
//   dangerouslyAllowBrowser: true,
// })

const openai = createOpenAI({
    apiKey: OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
})

export const getAIResponse = async (
  messages: Message[]
): Promise<StreamingTextResponse> => {
  // Trim the message context sent to the LLM to mitigate token abuse
  const trimmedMessageContext = messages;

//   const {lastAiSteps, setLastAiSteps } = useAppStore();

  console.log("tools:", tools);

  console.log("messages", trimmedMessageContext);
  console.log("convertToCoreMessages(trimmedMessageContext)", convertToCoreMessages(trimmedMessageContext));

  const result = await streamText({
    system: codeBlock`
    you are a helpful assistant,
    
    you will be given a list of tools that you can use to answer the user's question.
    Under the hood you have access to an in-browser Postgres database.
    you can use the tools to get information about the user's question or make changes to the database.

    to make updates, you can query records in the table, and also execute statements to update the table.

    to start a new user_events , create a new record in the user_events table with event_end_time as null
    to end a user_events , update the record with event_end_time as the current time

    the database tables are as follows:
    
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
    project_status VARCHAR(50) NULL
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


    you should also be able to create new graphs, to create new graph, we create a new record in the graphs table which uses chartjs to display the data.
    
    the data_query is a query that will be used to get the data for the graph, 
    ALWAYS make sure the data_query is a valid select SQL query with the following columns: key, value. I repeat, key and value.
 
    example of inserting into graph table, use similar way to create a new graph (just do it once per query request):
    INSERT INTO graphs (title, type, data_query, dataset_label, background_colors, hover_background_colors, should_display, created_at, updated_at) VALUES ('Weekly Event Count', 'line', ' WITH date_series AS ( SELECT generate_series( DATE(NOW() - INTERVAL ''6 days''), DATE(NOW()), ''1 day''::interval )::date AS date ), event_counts AS ( SELECT DATE(event_start_time) AS date, COUNT(*) AS value FROM user_events WHERE event_start_time >= NOW() - INTERVAL ''7 days'' GROUP BY DATE(event_start_time) ) SELECT ds.date AS key, COALESCE(ec.value, 0) AS value FROM date_series ds LEFT JOIN event_counts ec ON ds.date = ec.date ORDER BY ds.date; ', 'Events', ARRAY['#36A2EB'], ARRAY['#1E90FF'], true, '2024-10-15T01:35:54.440Z', '2024-10-15T01:35:54.440Z');
    `,
    model: openai('gpt-4o'),
    tools: {
      weather: tool({
        description: 'Get the weather in a location',
        parameters: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: async ({ location }) => ({
          location,
          temperature: 69,
        }),
      }),
      getRecords: tool({
        description: 'Get all records from a specified table',
        parameters: z.object({
          table_name: z.string().describe('The name of the table to get records from'),
        }),
        execute: async ({ table_name }) => {
          const records = await getRecordsFromTable(table_name);
          return { records };
        },
      }),
      executeQuery: tool({
        description: 'Execute a custom SQL query',
        parameters: z.object({
          query: z.string().describe('The SQL query to execute'),
        }),
        execute: async ({ query }) => {
          const result = await executeQuery(query);
          return { result };
        },
      })
    },
    prompt: messages[messages.length - 1].content,
    maxToolRoundtrips: 3,
  });
  console.log("result", result);
  console.log("result.text", result.text);
  console.log("result.steps", result.steps);

  result.steps.then(async (steps) => {
    await updateLastSteps(steps);
  });



  // Assuming result.text is not async iterable, convert it to one
//   const textChunks = result.text; // Ensure this is an array or iterable
return result.toAIStreamResponse()

  // Create a ReadableStream from the result
//   const stream = new ReadableStream({
//     async start(controller) {
//       for await (const chunk of textChunks) { // Use for-await-of to handle async iterables
//         console.log(chunk); // Log each chunk
//         controller.enqueue(chunk); // Stream each chunk immediately
//       }
//       controller.close();
//     },
//   });

//   return new StreamingTextResponse(stream);
}


const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};

// Expose API for other components
export const aiServiceAPI = {
  getAIResponse,
  transcribeAudio,
}

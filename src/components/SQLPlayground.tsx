import React, { useState } from 'react';
import { useDBStore } from '../postgres-db/stores';
import { executeQuery } from '../postgres-proxy/utils';

const SQLPlayground: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeSqlQuery = async () => {
    try {
      setError(null);
      const result = await executeQuery(query);
      setResults(result);
    } catch (err) {
      setError((err as Error).message);
      setResults(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">SQL Playground</h1>
      <div className="mb-4">
        <textarea
          className="w-full h-32 p-2 border rounded"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your SQL query here..."
        />
      </div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={executeSqlQuery}
      >
        Execute Query
      </button>
      {error && (
        <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {results && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Results:</h2>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                {results[0] && Object.keys(results[0].rows[0] || {}).map((key) => (
                  <th key={key} className="border p-2">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results[0] && results[0].rows.map((row: any, index: number) => (
                <tr key={index}>
                  {Object.values(row).map((value: any, cellIndex: number) => (
                    <td key={cellIndex} className="border p-2">{value?.toString() || 'NULL'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SQLPlayground;
'use client';

import { useState, useEffect } from 'react';

interface ApiResponse {
  message: string;
  timestamp: string;
}

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hello');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Next.js Frontend + Express Backend</h1>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Backend Connection Test:</h2>
        
        {loading && <p>Loading...</p>}
        
        {error && (
          <div style={{ color: 'red', marginTop: '1rem' }}>
            Error: {error}
          </div>
        )}
        
        {data && (
          <div style={{ marginTop: '1rem' }}>
            <p><strong>Message:</strong> {data.message}</p>
            <p><strong>Timestamp:</strong> {data.timestamp}</p>
          </div>
        )}
        
        <button 
          onClick={fetchData}
          style={{ 
            marginTop: '1rem', 
            padding: '0.5rem 1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}
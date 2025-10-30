import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/hello', (req, res) => {
  res.json({ 
    message: 'Hello from Express backend!',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
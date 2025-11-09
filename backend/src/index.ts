import express from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import http from 'http';
import connectDB from './config/db';
import TokenRoutes from './routes/tokenRoutes'
import userRoutes from './routes/userRoutes';


dotenv.config();
const PORT = 8000;

connectDB();

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/media', express.static(path.join(__dirname, '../media')));


const server = http.createServer(app);


app.get('/api', (req, res) => {
  res.send('Добро пожаловать в Express + TypeScript API');
});

app.use('/api/users', userRoutes);
app.use('/api/tokens', TokenRoutes);

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту: ${PORT}`);
});
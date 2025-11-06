import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';


const storage = multer.memoryStorage();

type FileFilterCallback = multer.FileFilterCallback;

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedTypes = [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'video/mp4', 
    'audio/mpeg'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only images, videos, and audio are allowed (jpeg, png, gif, mp4, mpeg).');
    cb(error);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter
});
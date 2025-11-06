import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { Request } from 'express';


const MEDIA_ROOT = path.join(__dirname, '../../media');
const UPLOADS_DIR = 'original';
const THUMBNAILS_DIR = 'thumbnails';


const ensureDirExists = async (dirPath: string) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// (async () => {
//   await ensureDirExists(path.join(MEDIA_ROOT, UPLOADS_DIR));
//   await ensureDirExists(path.join(MEDIA_ROOT, THUMBNAILS_DIR));
// })();

export const generateFileName = (bytes = 32) => 
  crypto.randomBytes(bytes).toString('hex');


export const createImageThumbnail = async (
  buffer: Buffer, 
  width = 300, 
  height = 300
): Promise<Buffer> => {
  return sharp(buffer)
    .resize(width, height, { 
      fit: 'inside', 
      withoutEnlargement: true 
    })
    .jpeg({ quality: 80 })
    .toBuffer();
};

export const deleteFile = async (fileName: string): Promise<void> => {
  const originalPath = path.join(MEDIA_ROOT, UPLOADS_DIR, fileName);
  const thumbPath = path.join(MEDIA_ROOT, THUMBNAILS_DIR, `thumb_${fileName}`);
  
  try {
    await fs.unlink(originalPath);
  } catch (error) {
    console.error(`Error deleting original file: ${error}`);
  }
  
  try {
    await fs.unlink(thumbPath);
  } catch (error) {
    console.error(`Error deleting thumbnail: ${error}`);
  }
};

export const getSignedUploadUrl = async (
  fileName: string,
  contentType: string,
  req: Request
): Promise<string> => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/api/media/upload-direct`;
};



export const uploadFile = async (
  fileBuffer: Buffer, 
  fileName: string, 
  mimetype: string,
  req: Request,
  subDir: string = UPLOADS_DIR
): Promise<string> => {
  const uploadDir = path.join(MEDIA_ROOT, subDir);
  await ensureDirExists(uploadDir);
  
  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, fileBuffer);
  
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/media/${subDir}/${fileName}`;
};


export const deleteFileFromSubdir = async (
  fileName: string, 
  subDir: string
): Promise<void> => {
  const filePath = path.join(MEDIA_ROOT, subDir, fileName);
  
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error(`Error deleting file from ${subDir}: ${error}`);
  }
};
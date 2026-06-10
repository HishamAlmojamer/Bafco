import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config';
import { AppError } from './errors';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.resolve(config.uploadDir);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    const name = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const imageFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'Only image files are allowed'));
  }
};

const cvFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'Only PDF and DOC files are allowed'));
  }
};

export const uploadImage = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
  fileFilter: imageFilter,
});

export const uploadCV = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
  fileFilter: cvFilter,
});

export const uploadGeneric = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
});

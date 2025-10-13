import { UserRepo } from "../modules/user/user.repo";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import path from 'path';
import multer from 'multer';

export async function authenticateUserToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token is not provided" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "defaultSecret"
    ) as { userId: number };
    if (!decoded?.userId) {
      res.status(401).json({ message: "Invalid token payload" });
      return;
    }
    const admin = await UserRepo.findOneBy({ id: decoded.userId });
    if (admin) {
      next();
    } else {
      res.status(401).json({ message: "Token is not valid or expired" });
    }
  } catch (err) {
    res.status(401).json({ message: "Token is not valid or expired" });
  }
}

// Allowed MIME types for images and Excel files
const MIME_TYPES = {
    images: ['image/jpeg', 'image/png', 'image/gif'],
};

// Define the upload directory
export const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// Storage configuration
export const storage = multer.diskStorage({
    destination: (req: Request, file, cb) => {
        // Set the same destination for both images and Excel files
        cb(null, UPLOADS_DIR);  // All files will be uploaded to the same directory
    },
    filename: (req: Request, file, cb) => {
        // Generate a unique file name based on timestamp and random number
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

// File filter to validate file types
export const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const isValidImage = MIME_TYPES.images.includes(file.mimetype);

    if (isValidImage) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed.'));
    }
};

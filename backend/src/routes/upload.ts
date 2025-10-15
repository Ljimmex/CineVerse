import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if ([...allowedVideoTypes, ...allowedImageTypes].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Upload video
router.post('/video', authenticate, requireAdmin, upload.single('video'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = `videos/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('videos')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
      });

    if (error) {
      throw new AppError('Failed to upload video', 500);
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('videos')
      .getPublicUrl(filePath);

    res.json({
      message: 'Video uploaded successfully',
      url: publicUrl,
      path: data.path,
    });
  } catch (error) {
    next(error);
  }
});

// Upload thumbnail
router.post('/thumbnail', authenticate, requireAdmin, upload.single('thumbnail'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = `thumbnails/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from('thumbnails')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
      });

    if (error) {
      throw new AppError('Failed to upload thumbnail', 500);
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('thumbnails')
      .getPublicUrl(filePath);

    res.json({
      message: 'Thumbnail uploaded successfully',
      url: publicUrl,
      path: data.path,
    });
  } catch (error) {
    next(error);
  }
});

// Upload poster
router.post('/poster', authenticate, requireAdmin, upload.single('poster'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = `posters/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from('posters')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
      });

    if (error) {
      throw new AppError('Failed to upload poster', 500);
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('posters')
      .getPublicUrl(filePath);

    res.json({
      message: 'Poster uploaded successfully',
      url: publicUrl,
      path: data.path,
    });
  } catch (error) {
    next(error);
  }
});

// Delete file from storage
router.delete('/:bucket/:path', authenticate, requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bucket, path } = req.params;
    const fullPath = req.query.fullPath as string;

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([fullPath || `${bucket}/${path}`]);

    if (error) {
      throw new AppError('Failed to delete file', 500);
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;


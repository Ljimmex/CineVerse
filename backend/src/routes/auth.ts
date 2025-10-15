import { Router, Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import { z } from 'zod';
import { validate } from '../middleware/validation.js';

const router = Router();

// Validation schemas
const signUpSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(2, 'Full name is required'),
  }),
});

const signInSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// Sign up
router.post('/signup', validate(signUpSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, fullName } = req.body;

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (error) {
      throw new AppError(error.message, 400);
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Sign in (handled by Supabase client, this is just for reference)
router.post('/signin', validate(signInSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AppError('Invalid credentials', 401);
    }

    res.json({
      message: 'Login successful',
      session: data.session,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      throw new AppError('Refresh token required', 400);
    }

    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      throw new AppError('Invalid refresh token', 401);
    }

    res.json({
      session: data.session,
    });
  } catch (error) {
    next(error);
  }
});

// Sign out
router.post('/signout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7);
    await supabaseAdmin.auth.admin.signOut(token);

    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;


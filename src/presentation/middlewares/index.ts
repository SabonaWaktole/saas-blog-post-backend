// Express Middlewares
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { jwtService, TokenPayload } from '../../infrastructure/auth';
import { blogRepository, postRepository } from '../../infrastructure/repositories';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
            guestIp?: string;
        }
    }
}

// Error response helper
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// Auth middleware - requires valid token
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }

    const token = authHeader.slice(7);
    const payload = jwtService.verifyAccessToken(token);

    if (!payload) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }

    req.user = payload;
    next();
}

// Optional auth - parses token if present
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const payload = jwtService.verifyAccessToken(token);
        if (payload) {
            req.user = payload;
        }
    }

    // Store guest IP for anonymous interactions
    req.guestIp = req.ip || req.socket.remoteAddress;
    next();
}

// Blog ownership middleware
export function blogOwnerMiddleware(blogIdParam: string = 'blogId') {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const blogId = req.params[blogIdParam];
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const isOwner = await blogRepository.isOwner(blogId, userId);
        if (!isOwner) {
            res.status(403).json({ error: 'You do not own this blog' });
            return;
        }

        next();
    };
}

// Post authorship middleware
export function postAuthorMiddleware(postIdParam: string = 'postId') {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const postId = req.params[postIdParam];
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const isAuthor = await postRepository.isAuthor(postId, userId);
        if (!isAuthor) {
            res.status(403).json({ error: 'You do not own this post' });
            return;
        }

        next();
    };
}

// Validation middleware factory
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (source === 'body') {
                console.log(`[VALIDATION-DEBUG] Validating ${req.method} ${req.url}`);
                console.log(`[VALIDATION-DEBUG] Body:`, JSON.stringify(req.body, null, 2));
            }

            const data = schema.parse(req[source]);
            req[source] = data; // Replace with parsed/coerced data
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                console.error('[VALIDATION-ERROR]', JSON.stringify(error.errors, null, 2));
                res.status(400).json({
                    error: 'Validation failed',
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                });
                return;
            }
            next(error);
        }
    };
}

// Request logger middleware
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const { method, url } = req;

    res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const log = `[${new Date().toISOString()}] ${method} ${url} ${status} - ${duration}ms`;

        if (status === 404) {
            console.log(`\x1b[31m${log}\x1b[0m`);
            console.log(`\x1b[33m[INFO] ☝️  404 Error: The requested resource was not found. If this is a specific ID, it might not exist in the database.\x1b[0m`);
        } else if (status >= 400) {
            console.log(`\x1b[31m${log}\x1b[0m`); // Red for errors
        } else {
            console.log(`\x1b[32m${log}\x1b[0m`); // Green for success
        }
    });

    next();
}

// Global error handler
export function errorMiddleware(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    console.error(`\x1b[31m[ERROR] ${err.message}\x1b[0m`);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    if (err instanceof ApiError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }

    // Handle common errors
    if (err.message.includes('Unauthorized')) {
        res.status(403).json({ error: err.message });
        return;
    }

    if (err.message.includes('not found') || err.message.includes('Not found')) {
        res.status(404).json({ error: err.message });
        return;
    }

    if (err.message.includes('already exists') || err.message.includes('Already')) {
        res.status(409).json({ error: err.message });
        return;
    }

    res.status(500).json({ error: 'Internal server error' });
}

// Async handler wrapper
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

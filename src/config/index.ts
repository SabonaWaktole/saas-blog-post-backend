import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),

    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret-key',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },

    supabase: {
        url: process.env.SUPABASE_URL || '',
        key: process.env.SUPABASE_KEY || '',
        buckets: {
            blogs: process.env.SUPABASE_BUCKET_BLOGS || 'blogs',
            avatars: process.env.SUPABASE_BUCKET_AVATARS || 'avatars',
            covers: process.env.SUPABASE_BUCKET_COVERS || 'covers',
        },
    },

    cors: {
        origin: process.env.CORS_ORIGIN || '*',
    },
} as const;

export type Config = typeof config;

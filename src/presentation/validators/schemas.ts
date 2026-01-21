// Validation schemas using Zod
import { z } from 'zod';

// Auth
export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Blog
export const createBlogSchema = z.object({
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    title: z.string().min(1).max(200),
    description: z.string().max(500).optional(),
});

export const updateBlogSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(500).optional(),
    logoUrl: z.string().url().optional(),
});

// Post
export const createPostSchema = z.object({
    slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    title: z.string().min(1).max(300),
    content: z.string().min(1),
    excerpt: z.string().max(500).optional(),
    coverImageUrl: z.string().url().optional(),
    seoTitle: z.string().max(60).optional(),
    seoDescription: z.string().max(160).optional(),
    categoryIds: z.array(z.string()).optional(),
    tagIds: z.array(z.string()).optional(),
});

export const updatePostSchema = z.object({
    title: z.string().min(1).max(300).optional(),
    content: z.string().min(1).optional(),
    excerpt: z.string().max(500).optional(),
    coverImageUrl: z.string().url().optional(),
    seoTitle: z.string().max(60).optional(),
    seoDescription: z.string().max(160).optional(),
    categoryIds: z.array(z.string()).optional(),
    tagIds: z.array(z.string()).optional(),
});

export const bulkStatusSchema = z.object({
    postIds: z.array(z.string()).min(1),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});

// Category
export const createCategorySchema = z.object({
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    parentId: z.string().optional(),
});

export const updateCategorySchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    parentId: z.string().nullable().optional(),
});

// Tag
export const createTagSchema = z.object({
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
    name: z.string().min(1).max(100),
});

// Analytics
export const trackReadTimeSchema = z.object({
    postId: z.string().min(1),
    readTimeSeconds: z.number().int().positive().max(3600), // Max 1 hour
    sessionId: z.string().optional(),
});

// Pagination
export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

export const postFilterSchema = z.object({
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    categoryId: z.string().optional(),
    tagId: z.string().optional(),
});

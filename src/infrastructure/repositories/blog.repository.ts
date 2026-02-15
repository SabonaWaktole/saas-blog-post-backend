// Blog Repository Implementation - Prisma
import { PrismaClient } from '@prisma/client';
import { IBlogRepository } from '../../domain/repositories/IBlogRepository';
import { Blog, CreateBlogInput, UpdateBlogInput } from '../../domain/entities/Blog';
import prisma from '../database/prisma';

export class PrismaBlogRepository implements IBlogRepository {
    private db: PrismaClient;

    constructor() {
        this.db = prisma;
    }

    async findById(id: string): Promise<Blog | null> {
        return this.db.blog.findUnique({ where: { id } });
    }

    async findBySlug(slug: string): Promise<Blog | null> {
        return this.db.blog.findUnique({ where: { slug } });
    }

    async findByOwnerId(ownerId: string): Promise<Blog[]> {
        const blogs = await this.db.blog.findMany({
            where: { ownerId },
            include: {
                _count: {
                    select: { posts: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return blogs.map(b => ({
            ...b,
            postCount: b._count.posts
        }));
    }

    async create(input: CreateBlogInput): Promise<Blog> {
        return this.db.blog.create({
            data: {
                slug: input.slug,
                title: input.title,
                description: input.description,
                logoUrl: input.logoUrl,
                ownerId: input.ownerId,
            },
        });
    }

    async update(id: string, input: UpdateBlogInput): Promise<Blog> {
        return this.db.blog.update({
            where: { id },
            data: input,
        });
    }

    async delete(id: string): Promise<void> {
        await this.db.blog.delete({ where: { id } });
    }

    async isOwner(blogId: string, userId: string): Promise<boolean> {
        const blog = await this.db.blog.findUnique({
            where: { id: blogId },
            select: { ownerId: true },
        });
        return blog?.ownerId === userId;
    }
}

export const blogRepository = new PrismaBlogRepository();

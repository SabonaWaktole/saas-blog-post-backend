// Tag Repository Implementation - Prisma
import { PrismaClient } from '@prisma/client';
import { ITagRepository } from '../../domain/repositories/ITagRepository';
import { Tag, CreateTagInput } from '../../domain/entities/Tag';
import prisma from '../database/prisma';

export class PrismaTagRepository implements ITagRepository {
    private db: PrismaClient;

    constructor() {
        this.db = prisma;
    }

    async findById(id: string): Promise<Tag | null> {
        return this.db.tag.findUnique({ where: { id } });
    }

    async findBySlug(blogId: string, slug: string): Promise<Tag | null> {
        return this.db.tag.findUnique({
            where: { blogId_slug: { blogId, slug } },
        });
    }

    async findByBlogId(blogId: string): Promise<Tag[]> {
        return this.db.tag.findMany({
            where: { blogId },
            orderBy: { name: 'asc' },
        });
    }

    async create(input: CreateTagInput): Promise<Tag> {
        return this.db.tag.create({
            data: {
                slug: input.slug,
                name: input.name,
                blogId: input.blogId,
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.db.tag.delete({ where: { id } });
    }
}

export const tagRepository = new PrismaTagRepository();

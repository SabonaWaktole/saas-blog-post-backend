// Category Repository Implementation - Prisma
import { PrismaClient } from '@prisma/client';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { Category, CreateCategoryInput, UpdateCategoryInput, CategoryWithChildren } from '../../domain/entities/Category';
import prisma from '../database/prisma';

export class PrismaCategoryRepository implements ICategoryRepository {
    private db: PrismaClient;

    constructor() {
        this.db = prisma;
    }

    async findById(id: string): Promise<Category | null> {
        return this.db.category.findUnique({ where: { id } });
    }

    async findBySlug(blogId: string, slug: string): Promise<Category | null> {
        return this.db.category.findUnique({
            where: { blogId_slug: { blogId, slug } },
        });
    }

    async findByBlogId(blogId: string): Promise<Category[]> {
        return this.db.category.findMany({
            where: { blogId },
            orderBy: { name: 'asc' },
        });
    }

    async findByBlogIdWithChildren(blogId: string): Promise<CategoryWithChildren[]> {
        const categories = await this.db.category.findMany({
            where: { blogId, parentId: null },
            include: {
                children: {
                    include: {
                        children: true, // Two levels deep
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        return categories as CategoryWithChildren[];
    }

    async create(input: CreateCategoryInput): Promise<Category> {
        return this.db.category.create({
            data: {
                slug: input.slug,
                name: input.name,
                description: input.description,
                parentId: input.parentId,
                blogId: input.blogId,
            },
        });
    }

    async update(id: string, input: UpdateCategoryInput): Promise<Category> {
        return this.db.category.update({
            where: { id },
            data: input,
        });
    }

    async delete(id: string): Promise<void> {
        await this.db.category.delete({ where: { id } });
    }
}

export const categoryRepository = new PrismaCategoryRepository();

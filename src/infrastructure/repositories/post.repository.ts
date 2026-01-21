// Post Repository Implementation - Prisma
import { PrismaClient, Post as PrismaPost } from '@prisma/client';
import { IPostRepository, PaginationOptions, PostFilterOptions, PaginatedResult } from '../../domain/repositories/IPostRepository';
import { Post, CreatePostInput, UpdatePostInput, PostStatus, PostWithCounts } from '../../domain/entities/Post';
import prisma from '../database/prisma';

function toDomainPost(p: PrismaPost): Post {
    return {
        ...p,
        status: p.status as PostStatus,
        featured: p.featured,
        readTimeMinutes: p.readTimeMinutes,
    };
}

function toDomainPostWithCounts(p: any): PostWithCounts {
    return {
        ...p,
        status: p.status as PostStatus,
        featured: p.featured,
        readTimeMinutes: p.readTimeMinutes,
        likeCount: p._count?.likes ?? 0,
        bookmarkCount: p._count?.bookmarks ?? 0,
        author: p.author ? {
            id: p.author.id,
            email: p.author.email,
            avatarUrl: p.author.authorProfile?.avatarUrl ?? null,
        } : undefined,
    };
}

function calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
}

export class PrismaPostRepository implements IPostRepository {
    private db: PrismaClient;

    constructor() {
        this.db = prisma;
    }

    async findById(id: string): Promise<Post | null> {
        const post = await this.db.post.findUnique({ where: { id } });
        return post ? toDomainPost(post) : null;
    }

    async findBySlug(blogId: string, slug: string): Promise<PostWithCounts | null> {
        const post = await this.db.post.findUnique({
            where: { blogId_slug: { blogId, slug } },
            include: {
                _count: { select: { likes: true, bookmarks: true } },
                categories: { include: { category: true } },
                tags: { include: { tag: true } },
                author: {
                    select: {
                        id: true,
                        email: true,
                        authorProfile: { select: { avatarUrl: true } }
                    }
                },
            },
        });
        return post ? toDomainPostWithCounts(post) : null;
    }

    async findByBlogId(
        blogId: string,
        options: PaginationOptions,
        filters?: PostFilterOptions
    ): Promise<PaginatedResult<PostWithCounts>> {
        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const where: any = { blogId };
        if (filters?.status) where.status = filters.status;
        if (filters?.categoryId) {
            where.categories = { some: { categoryId: filters.categoryId } };
        }
        if (filters?.tagId) {
            where.tags = { some: { tagId: filters.tagId } };
        }
        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search } }, // Case-insensitive not supported by SQLite by default without specific collation, but mostly works for basic ASCII
                { content: { contains: filters.search } },
            ];
        }

        const [posts, total] = await Promise.all([
            this.db.post.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { likes: true, bookmarks: true } },
                    author: {
                        select: {
                            id: true,
                            email: true,
                            authorProfile: { select: { avatarUrl: true } }
                        }
                    },
                },
            }),
            this.db.post.count({ where }),
        ]);

        return {
            data: posts.map(p => toDomainPostWithCounts(p)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findPublishedByBlogId(
        blogId: string,
        options: PaginationOptions
    ): Promise<PaginatedResult<PostWithCounts>> {
        return this.findByBlogId(blogId, options, { status: 'PUBLISHED' });
    }

    async create(input: CreatePostInput): Promise<Post> {
        const post = await this.db.post.create({
            data: {
                slug: input.slug,
                title: input.title,
                content: input.content,
                excerpt: input.excerpt,
                coverImageUrl: input.coverImageUrl,
                seoTitle: input.seoTitle,
                seoDescription: input.seoDescription,
                blogId: input.blogId,
                authorId: input.authorId,
                status: 'DRAFT',
                featured: input.featured ?? false,
                readTimeMinutes: calculateReadTime(input.content),
            },
        });
        return toDomainPost(post);
    }

    async update(id: string, input: UpdatePostInput): Promise<Post> {
        const data: any = { ...input };
        if (input.content) {
            data.readTimeMinutes = calculateReadTime(input.content);
        }

        const post = await this.db.post.update({
            where: { id },
            data,
        });
        return toDomainPost(post);
    }

    async updateStatus(id: string, status: PostStatus): Promise<Post> {
        const data: any = { status };
        if (status === 'PUBLISHED') {
            data.publishedAt = new Date();
        }
        const post = await this.db.post.update({ where: { id }, data });
        return toDomainPost(post);
    }

    async bulkUpdateStatus(ids: string[], status: PostStatus): Promise<number> {
        const data: any = { status };
        if (status === 'PUBLISHED') {
            data.publishedAt = new Date();
        }
        const result = await this.db.post.updateMany({
            where: { id: { in: ids } },
            data,
        });
        return result.count;
    }

    async delete(id: string): Promise<void> {
        await this.db.post.delete({ where: { id } });
    }

    async isAuthor(postId: string, userId: string): Promise<boolean> {
        const post = await this.db.post.findUnique({
            where: { id: postId },
            select: { authorId: true, blog: { select: { ownerId: true } } },
        });
        return post?.authorId === userId || post?.blog.ownerId === userId;
    }

    async getRelatedPosts(postId: string, limit: number): Promise<PostWithCounts[]> {
        const post = await this.db.post.findUnique({
            where: { id: postId },
            include: { tags: true, categories: true },
        });

        if (!post) return [];

        const tagIds = post.tags.map((t: any) => t.tagId);
        const categoryIds = post.categories.map((c: any) => c.categoryId);

        if (tagIds.length === 0 && categoryIds.length === 0) {
            // No tags or categories, return recent posts from same blog
            const related = await this.db.post.findMany({
                where: {
                    id: { not: postId },
                    blogId: post.blogId,
                    status: 'PUBLISHED',
                },
                take: limit,
                orderBy: { publishedAt: 'desc' },
                include: { _count: { select: { likes: true, bookmarks: true } } },
            });
            return related.map(p => toDomainPostWithCounts(p));
        }

        const orConditions: any[] = [];
        if (tagIds.length > 0) {
            orConditions.push({ tags: { some: { tagId: { in: tagIds } } } });
        }
        if (categoryIds.length > 0) {
            orConditions.push({ categories: { some: { categoryId: { in: categoryIds } } } });
        }

        const related = await this.db.post.findMany({
            where: {
                id: { not: postId },
                blogId: post.blogId,
                status: 'PUBLISHED',
                OR: orConditions,
            },
            take: limit,
            orderBy: { publishedAt: 'desc' },
            include: { _count: { select: { likes: true, bookmarks: true } } },
        });

        return related.map(p => toDomainPostWithCounts(p));
    }

    async addCategories(postId: string, categoryIds: string[]): Promise<void> {
        if (categoryIds.length === 0) return;
        // Insert one by one to handle duplicates gracefully (SQLite doesn't support skipDuplicates)
        for (const categoryId of categoryIds) {
            try {
                await this.db.postCategory.create({
                    data: { postId, categoryId },
                });
            } catch {
                // Ignore duplicate errors
            }
        }
    }

    async removeCategories(postId: string, categoryIds: string[]): Promise<void> {
        if (categoryIds.length === 0) return;
        await this.db.postCategory.deleteMany({
            where: { postId, categoryId: { in: categoryIds } },
        });
    }

    async clearCategories(postId: string): Promise<void> {
        await this.db.postCategory.deleteMany({
            where: { postId },
        });
    }

    async addTags(postId: string, tagIds: string[]): Promise<void> {
        if (tagIds.length === 0) return;
        // Insert one by one to handle duplicates gracefully (SQLite doesn't support skipDuplicates)
        for (const tagId of tagIds) {
            try {
                await this.db.postTag.create({
                    data: { postId, tagId },
                });
            } catch {
                // Ignore duplicate errors
            }
        }
    }

    async removeTags(postId: string, tagIds: string[]): Promise<void> {
        if (tagIds.length === 0) return;
        await this.db.postTag.deleteMany({
            where: { postId, tagId: { in: tagIds } },
        });
    }

    async clearTags(postId: string): Promise<void> {
        await this.db.postTag.deleteMany({
            where: { postId },
        });
    }
}

export const postRepository = new PrismaPostRepository();

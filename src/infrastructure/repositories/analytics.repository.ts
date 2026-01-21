// Analytics Repository Implementation - Prisma
import { PrismaClient } from '@prisma/client';
import { IAnalyticsRepository } from '../../domain/repositories/IAnalyticsRepository';
import {
    ReadTimeLog,
    CreateReadTimeLogInput,
    PostAnalytics,
    BlogAnalytics,
    AuthorDashboardAnalytics
} from '../../domain/entities/Analytics';
import prisma from '../database/prisma';

export class PrismaAnalyticsRepository implements IAnalyticsRepository {
    private db: PrismaClient;

    constructor() {
        this.db = prisma;
    }

    async createReadTimeLog(input: CreateReadTimeLogInput): Promise<ReadTimeLog> {
        return this.db.readTimeLog.create({
            data: {
                postId: input.postId,
                blogId: input.blogId,
                userId: input.userId,
                sessionId: input.sessionId,
                readTimeSeconds: input.readTimeSeconds,
            },
        });
    }

    async getPostAnalytics(postId: string): Promise<PostAnalytics> {
        const [readTimeData, uniqueReaders, likeCount, bookmarkCount] = await Promise.all([
            this.db.readTimeLog.aggregate({
                where: { postId },
                _sum: { readTimeSeconds: true },
            }),
            this.db.readTimeLog.groupBy({
                by: ['userId', 'sessionId'],
                where: { postId },
            }),
            this.db.like.count({ where: { postId } }),
            this.db.bookmark.count({ where: { postId } }),
        ]);

        const totalReadTime = readTimeData._sum.readTimeSeconds || 0;
        // Estimate read rate based on average content length (500 words = ~2.5 min read)
        const estimatedReadRate = Math.min(100, (totalReadTime / 150) * 100);

        return {
            postId,
            totalReadTimeSeconds: totalReadTime,
            uniqueReaders: uniqueReaders.length,
            likeCount,
            bookmarkCount,
            estimatedReadRate,
        };
    }

    async getBlogAnalytics(blogId: string): Promise<BlogAnalytics> {
        const [readTimeData, likeCount, postCount, topPosts] = await Promise.all([
            this.db.readTimeLog.aggregate({
                where: { blogId },
                _sum: { readTimeSeconds: true },
            }),
            this.db.like.count({
                where: { post: { blogId } },
            }),
            this.db.post.count({ where: { blogId } }),
            this.db.post.findMany({
                where: { blogId, status: 'PUBLISHED' },
                take: 5,
                orderBy: { likes: { _count: 'desc' } },
                include: {
                    _count: { select: { likes: true } },
                    readTimeLogs: {
                        select: { readTimeSeconds: true },
                    },
                },
            }),
        ]);

        return {
            blogId,
            totalReadTimeSeconds: readTimeData._sum.readTimeSeconds || 0,
            totalLikes: likeCount,
            totalPosts: postCount,
            topPosts: topPosts.map((p: any) => ({
                postId: p.id,
                title: p.title,
                likeCount: p._count.likes,
                readTimeSeconds: p.readTimeLogs.reduce((sum: number, log: any) => sum + log.readTimeSeconds, 0),
            })),
        };
    }

    async getAuthorDashboard(userId: string): Promise<AuthorDashboardAnalytics> {
        // Get all blogs owned by user
        const blogs = await this.db.blog.findMany({
            where: { ownerId: userId },
            include: {
                posts: {
                    include: {
                        _count: { select: { likes: true } },
                        readTimeLogs: { select: { readTimeSeconds: true } },
                    },
                },
            },
        });

        // Calculate totals
        let totalLikes = 0;
        let totalReadTime = 0;
        let totalPosts = 0;

        const blogBreakdown = blogs.map((blog: any) => {
            let blogLikes = 0;
            let blogReadTime = 0;

            blog.posts.forEach((post: any) => {
                blogLikes += post._count.likes;
                const postReadTime = post.readTimeLogs.reduce((sum: number, log: any) => sum + log.readTimeSeconds, 0);
                blogReadTime += postReadTime;
            });

            totalLikes += blogLikes;
            totalReadTime += blogReadTime;
            totalPosts += blog.posts.length;

            return {
                blogId: blog.id,
                blogTitle: blog.title,
                totalLikes: blogLikes,
                totalReadTimeSeconds: blogReadTime,
                postCount: blog.posts.length,
            };
        });

        // Get follower count
        const followerCount = await this.db.follow.count({
            where: { followingId: userId },
        });

        return {
            totalLikes,
            totalFollowers: followerCount,
            totalReadTimeSeconds: totalReadTime,
            totalPosts,
            blogBreakdown,
        };
    }
}

export const analyticsRepository = new PrismaAnalyticsRepository();

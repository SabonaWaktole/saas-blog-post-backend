// Interaction Repository Implementation - Prisma
import { PrismaClient } from '@prisma/client';
import { IInteractionRepository } from '../../domain/repositories/IInteractionRepository';
import { Like, CreateLikeInput, Bookmark, CreateBookmarkInput, Follow, CreateFollowInput } from '../../domain/entities/Interaction';
import prisma from '../database/prisma';

export class PrismaInteractionRepository implements IInteractionRepository {
    private db: PrismaClient;

    constructor() {
        this.db = prisma;
    }

    // ============== Likes ==============

    async findLike(postId: string, userId?: string, guestIp?: string): Promise<Like | null> {
        if (userId) {
            return this.db.like.findUnique({
                where: { postId_userId: { postId, userId } },
            });
        }
        if (guestIp) {
            return this.db.like.findUnique({
                where: { postId_guestIp: { postId, guestIp } },
            });
        }
        return null;
    }

    async createLike(input: CreateLikeInput): Promise<Like> {
        return this.db.like.create({
            data: {
                postId: input.postId,
                userId: input.userId,
                guestIp: input.guestIp,
            },
        });
    }

    async deleteLike(postId: string, userId?: string, guestIp?: string): Promise<void> {
        if (userId) {
            await this.db.like.delete({
                where: { postId_userId: { postId, userId } },
            });
        } else if (guestIp) {
            await this.db.like.delete({
                where: { postId_guestIp: { postId, guestIp } },
            });
        }
    }

    async getLikeCount(postId: string): Promise<number> {
        return this.db.like.count({ where: { postId } });
    }

    // ============== Bookmarks ==============

    async findBookmark(postId: string, userId: string): Promise<Bookmark | null> {
        return this.db.bookmark.findUnique({
            where: { postId_userId: { postId, userId } },
        });
    }

    async createBookmark(input: CreateBookmarkInput): Promise<Bookmark> {
        return this.db.bookmark.create({
            data: {
                postId: input.postId,
                userId: input.userId,
            },
        });
    }

    async deleteBookmark(postId: string, userId: string): Promise<void> {
        await this.db.bookmark.delete({
            where: { postId_userId: { postId, userId } },
        });
    }

    async getBookmarkCount(postId: string): Promise<number> {
        return this.db.bookmark.count({ where: { postId } });
    }

    async getUserBookmarks(userId: string): Promise<Bookmark[]> {
        return this.db.bookmark.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    // ============== Follows ==============

    async findFollow(followerId: string, followingId: string): Promise<Follow | null> {
        return this.db.follow.findUnique({
            where: { followerId_followingId: { followerId, followingId } },
        });
    }

    async createFollow(input: CreateFollowInput): Promise<Follow> {
        return this.db.follow.create({
            data: {
                followerId: input.followerId,
                followingId: input.followingId,
            },
        });
    }

    async deleteFollow(followerId: string, followingId: string): Promise<void> {
        await this.db.follow.delete({
            where: { followerId_followingId: { followerId, followingId } },
        });
    }

    async getFollowerCount(userId: string): Promise<number> {
        return this.db.follow.count({ where: { followingId: userId } });
    }

    async getFollowingCount(userId: string): Promise<number> {
        return this.db.follow.count({ where: { followerId: userId } });
    }

    async getFollowers(userId: string): Promise<Follow[]> {
        return this.db.follow.findMany({
            where: { followingId: userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getFollowing(userId: string): Promise<Follow[]> {
        return this.db.follow.findMany({
            where: { followerId: userId },
            orderBy: { createdAt: 'desc' },
        });
    }
}

export const interactionRepository = new PrismaInteractionRepository();

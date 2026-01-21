// Author Profile Repository Implementation
import { PrismaClient } from '@prisma/client';
import { AuthorProfile, CreateAuthorProfileInput, UpdateAuthorProfileInput, PublicAuthorProfile } from '../../domain/entities/AuthorProfile';
import prisma from '../database/prisma';

export interface IAuthorProfileRepository {
    findById(id: string): Promise<AuthorProfile | null>;
    findByUserId(userId: string): Promise<AuthorProfile | null>;
    getPublicProfile(userId: string): Promise<PublicAuthorProfile | null>;
    create(input: CreateAuthorProfileInput): Promise<AuthorProfile>;
    update(userId: string, input: UpdateAuthorProfileInput): Promise<AuthorProfile>;
}

export class PrismaAuthorProfileRepository implements IAuthorProfileRepository {
    private db: PrismaClient;

    constructor() {
        this.db = prisma;
    }

    async findById(id: string): Promise<AuthorProfile | null> {
        return this.db.authorProfile.findUnique({ where: { id } });
    }

    async findByUserId(userId: string): Promise<AuthorProfile | null> {
        return this.db.authorProfile.findUnique({ where: { userId } });
    }

    async getPublicProfile(userId: string): Promise<PublicAuthorProfile | null> {
        const profile = await this.db.authorProfile.findUnique({
            where: { userId },
        });

        if (!profile) return null;

        const [followerCount, followingCount, postCount] = await Promise.all([
            this.db.follow.count({ where: { followingId: userId } }),
            this.db.follow.count({ where: { followerId: userId } }),
            this.db.post.count({ where: { authorId: userId, status: 'PUBLISHED' } }),
        ]);

        return {
            id: profile.id,
            bio: profile.bio,
            location: profile.location,
            avatarUrl: profile.avatarUrl,
            website: profile.website,
            twitter: profile.twitter,
            github: profile.github,
            followerCount,
            followingCount,
            postCount,
        };
    }

    async create(input: CreateAuthorProfileInput): Promise<AuthorProfile> {
        return this.db.authorProfile.create({
            data: {
                userId: input.userId,
                bio: input.bio,
                location: input.location,
                avatarUrl: input.avatarUrl,
                website: input.website,
                twitter: input.twitter,
                github: input.github,
            },
        });
    }

    async update(userId: string, input: UpdateAuthorProfileInput): Promise<AuthorProfile> {
        return this.db.authorProfile.update({
            where: { userId },
            data: input,
        });
    }
}

export const authorProfileRepository = new PrismaAuthorProfileRepository();

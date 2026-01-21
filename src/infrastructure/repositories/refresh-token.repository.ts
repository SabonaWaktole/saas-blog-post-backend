// Refresh Token Repository
import { PrismaClient } from '@prisma/client';
import prisma from '../database/prisma';

export interface RefreshToken {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
}

export interface IRefreshTokenRepository {
    findByToken(token: string): Promise<RefreshToken | null>;
    create(userId: string, token: string, expiresAt: Date): Promise<RefreshToken>;
    deleteByToken(token: string): Promise<void>;
    deleteAllForUser(userId: string): Promise<void>;
    deleteExpired(): Promise<number>;
}

export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
    private db: PrismaClient;

    constructor() {
        this.db = prisma;
    }

    async findByToken(token: string): Promise<RefreshToken | null> {
        return this.db.refreshToken.findUnique({ where: { token } });
    }

    async create(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
        return this.db.refreshToken.create({
            data: { userId, token, expiresAt },
        });
    }

    async deleteByToken(token: string): Promise<void> {
        await this.db.refreshToken.delete({ where: { token } });
    }

    async deleteAllForUser(userId: string): Promise<void> {
        await this.db.refreshToken.deleteMany({ where: { userId } });
    }

    async deleteExpired(): Promise<number> {
        const result = await this.db.refreshToken.deleteMany({
            where: { expiresAt: { lt: new Date() } },
        });
        return result.count;
    }
}

export const refreshTokenRepository = new PrismaRefreshTokenRepository();

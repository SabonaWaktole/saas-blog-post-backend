// User Repository Implementation - Prisma
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User, CreateUserInput, UserRole } from '../../domain/entities/User';
import prisma from '../database/prisma';

function toDomainUser(prismaUser: PrismaUser): User {
    return {
        ...prismaUser,
        role: prismaUser.role as UserRole,
    };
}

export class PrismaUserRepository implements IUserRepository {
    private db: PrismaClient;

    constructor() {
        this.db = prisma;
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.db.user.findUnique({ where: { id } });
        return user ? toDomainUser(user) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.db.user.findUnique({ where: { email } });
        return user ? toDomainUser(user) : null;
    }

    async create(input: CreateUserInput): Promise<User> {
        const user = await this.db.user.create({
            data: {
                email: input.email,
                passwordHash: input.passwordHash,
                role: input.role || 'OWNER',
            },
        });
        return toDomainUser(user);
    }

    async updatePassword(id: string, passwordHash: string): Promise<User> {
        const user = await this.db.user.update({
            where: { id },
            data: { passwordHash },
        });
        return toDomainUser(user);
    }

    async delete(id: string): Promise<void> {
        await this.db.user.delete({ where: { id } });
    }
}

export const userRepository = new PrismaUserRepository();

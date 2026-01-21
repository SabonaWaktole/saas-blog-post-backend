// User Entity - Domain Layer
// No framework dependencies

export type UserRole = 'OWNER' | 'EDITOR';

export interface User {
    id: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserInput {
    email: string;
    passwordHash: string;
    role?: UserRole;
}

export interface UserWithoutPassword {
    id: string;
    email: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export function toUserWithoutPassword(user: User): UserWithoutPassword {
    const { passwordHash, ...rest } = user;
    return rest;
}

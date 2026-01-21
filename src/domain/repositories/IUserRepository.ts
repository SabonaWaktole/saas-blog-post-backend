// User Repository Interface - Domain Layer
import { User, CreateUserInput, UserWithoutPassword } from '../entities/User';

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(input: CreateUserInput): Promise<User>;
    updatePassword(id: string, passwordHash: string): Promise<User>;
    delete(id: string): Promise<void>;
}

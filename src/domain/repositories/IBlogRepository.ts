// Blog Repository Interface - Domain Layer
import { Blog, CreateBlogInput, UpdateBlogInput } from '../entities/Blog';

export interface IBlogRepository {
    findById(id: string): Promise<Blog | null>;
    findBySlug(slug: string): Promise<Blog | null>;
    findByOwnerId(ownerId: string): Promise<Blog[]>;
    create(input: CreateBlogInput): Promise<Blog>;
    update(id: string, input: UpdateBlogInput): Promise<Blog>;
    delete(id: string): Promise<void>;
    isOwner(blogId: string, userId: string): Promise<boolean>;
}

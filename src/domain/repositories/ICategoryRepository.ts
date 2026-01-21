// Category Repository Interface - Domain Layer
import { Category, CreateCategoryInput, UpdateCategoryInput, CategoryWithChildren } from '../entities/Category';

export interface ICategoryRepository {
    findById(id: string): Promise<Category | null>;
    findBySlug(blogId: string, slug: string): Promise<Category | null>;
    findByBlogId(blogId: string): Promise<Category[]>;
    findByBlogIdWithChildren(blogId: string): Promise<CategoryWithChildren[]>;
    create(input: CreateCategoryInput): Promise<Category>;
    update(id: string, input: UpdateCategoryInput): Promise<Category>;
    delete(id: string): Promise<void>;
}

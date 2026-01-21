// Tag Repository Interface - Domain Layer
import { Tag, CreateTagInput } from '../entities/Tag';

export interface ITagRepository {
    findById(id: string): Promise<Tag | null>;
    findBySlug(blogId: string, slug: string): Promise<Tag | null>;
    findByBlogId(blogId: string): Promise<Tag[]>;
    create(input: CreateTagInput): Promise<Tag>;
    delete(id: string): Promise<void>;
}

// Blog Use Cases
import { blogRepository } from '../../infrastructure/repositories';
import { Blog, CreateBlogInput, UpdateBlogInput } from '../../domain/entities/Blog';

export class BlogUseCases {
    async create(ownerId: string, input: Omit<CreateBlogInput, 'ownerId'>): Promise<Blog> {
        // Check slug uniqueness
        const existing = await blogRepository.findBySlug(input.slug);
        if (existing) {
            throw new Error('Blog slug already exists');
        }

        return blogRepository.create({
            ...input,
            ownerId,
        });
    }

    async update(blogId: string, userId: string, input: UpdateBlogInput): Promise<Blog> {
        // Verify ownership
        const isOwner = await blogRepository.isOwner(blogId, userId);
        if (!isOwner) {
            throw new Error('Unauthorized: You do not own this blog');
        }

        return blogRepository.update(blogId, input);
    }

    async delete(blogId: string, userId: string): Promise<void> {
        // Verify ownership
        const isOwner = await blogRepository.isOwner(blogId, userId);
        if (!isOwner) {
            throw new Error('Unauthorized: You do not own this blog');
        }

        await blogRepository.delete(blogId);
    }

    async getById(blogId: string): Promise<Blog | null> {
        return blogRepository.findById(blogId);
    }

    async getBySlug(slug: string): Promise<Blog | null> {
        return blogRepository.findBySlug(slug);
    }

    async listByOwner(ownerId: string): Promise<Blog[]> {
        return blogRepository.findByOwnerId(ownerId);
    }

    async verifyOwnership(blogId: string, userId: string): Promise<boolean> {
        return blogRepository.isOwner(blogId, userId);
    }
}

export const blogUseCases = new BlogUseCases();

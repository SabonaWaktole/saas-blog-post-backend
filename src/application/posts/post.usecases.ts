// Post Use Cases
import { postRepository, blogRepository } from '../../infrastructure/repositories';
import { Post, UpdatePostInput, PostStatus, PostWithCounts } from '../../domain/entities/Post';
import { PaginationOptions, PostFilterOptions, PaginatedResult } from '../../domain/repositories/IPostRepository';

export interface CreatePostParams {
    slug: string;
    title: string;
    content: string;
    excerpt?: string;
    coverImageUrl?: string;
    seoTitle?: string;
    seoDescription?: string;
    categoryIds?: string[];
    tagIds?: string[];
}

export class PostUseCases {
    async create(
        blogId: string,
        authorId: string,
        input: CreatePostParams
    ): Promise<Post> {
        // Verify user can post to this blog
        const isOwner = await blogRepository.isOwner(blogId, authorId);
        if (!isOwner) {
            throw new Error('Unauthorized: You cannot post to this blog');
        }

        // Create post
        const post = await postRepository.create({
            slug: input.slug,
            title: input.title,
            content: input.content,
            excerpt: input.excerpt,
            coverImageUrl: input.coverImageUrl,
            seoTitle: input.seoTitle,
            seoDescription: input.seoDescription,
            blogId,
            authorId,
        });

        // Add categories and tags if provided
        if (input.categoryIds?.length) {
            await postRepository.addCategories(post.id, input.categoryIds);
        }
        if (input.tagIds?.length) {
            await postRepository.addTags(post.id, input.tagIds);
        }

        return post;
    }

    async update(
        postId: string,
        userId: string,
        input: UpdatePostInput & { categoryIds?: string[]; tagIds?: string[] }
    ): Promise<Post> {
        // Verify authorship
        const isAuthor = await postRepository.isAuthor(postId, userId);
        if (!isAuthor) {
            throw new Error('Unauthorized: You cannot edit this post');
        }

        const { categoryIds, tagIds, ...updateData } = input;
        const post = await postRepository.update(postId, updateData);

        // Update categories if provided (replace all)
        if (categoryIds !== undefined) {
            await postRepository.clearCategories(postId);
            if (categoryIds.length) {
                await postRepository.addCategories(postId, categoryIds);
            }
        }

        // Update tags if provided (replace all)
        if (tagIds !== undefined) {
            await postRepository.clearTags(postId);
            if (tagIds.length) {
                await postRepository.addTags(postId, tagIds);
            }
        }

        return post;
    }

    async publish(postId: string, userId: string): Promise<Post> {
        const isAuthor = await postRepository.isAuthor(postId, userId);
        if (!isAuthor) {
            throw new Error('Unauthorized: You cannot publish this post');
        }

        return postRepository.updateStatus(postId, 'PUBLISHED');
    }

    async archive(postId: string, userId: string): Promise<Post> {
        const isAuthor = await postRepository.isAuthor(postId, userId);
        if (!isAuthor) {
            throw new Error('Unauthorized: You cannot archive this post');
        }

        return postRepository.updateStatus(postId, 'ARCHIVED');
    }

    async unpublish(postId: string, userId: string): Promise<Post> {
        const isAuthor = await postRepository.isAuthor(postId, userId);
        if (!isAuthor) {
            throw new Error('Unauthorized: You cannot unpublish this post');
        }

        return postRepository.updateStatus(postId, 'DRAFT');
    }

    async bulkUpdateStatus(
        postIds: string[],
        status: PostStatus,
        userId: string
    ): Promise<number> {
        // Verify all posts belong to user's blogs
        for (const postId of postIds) {
            const isAuthor = await postRepository.isAuthor(postId, userId);
            if (!isAuthor) {
                throw new Error(`Unauthorized: You cannot modify post ${postId}`);
            }
        }

        return postRepository.bulkUpdateStatus(postIds, status);
    }

    async delete(postId: string, userId: string): Promise<void> {
        const isAuthor = await postRepository.isAuthor(postId, userId);
        if (!isAuthor) {
            throw new Error('Unauthorized: You cannot delete this post');
        }

        await postRepository.delete(postId);
    }

    async getById(postId: string): Promise<Post | null> {
        return postRepository.findById(postId);
    }

    async getBySlug(blogId: string, slug: string): Promise<PostWithCounts | null> {
        const post = await postRepository.findBySlug(blogId, slug);
        if (!post || post.status !== 'PUBLISHED') {
            return null;
        }
        return post;
    }

    async getBySlugForAuthor(
        blogId: string,
        slug: string,
        userId: string
    ): Promise<PostWithCounts | null> {
        const post = await postRepository.findBySlug(blogId, slug);
        if (!post) return null;

        // Authors can see their own non-published posts
        const isAuthor = await postRepository.isAuthor(post.id, userId);
        if (!isAuthor && post.status !== 'PUBLISHED') {
            return null;
        }

        return post;
    }

    async listByBlog(
        blogId: string,
        options: PaginationOptions,
        filters?: PostFilterOptions
    ): Promise<PaginatedResult<PostWithCounts>> {
        return postRepository.findByBlogId(blogId, options, filters);
    }

    async listPublishedByBlog(
        blogId: string,
        options: PaginationOptions
    ): Promise<PaginatedResult<PostWithCounts>> {
        return postRepository.findPublishedByBlogId(blogId, options);
    }

    async getRelatedPosts(postId: string, limit: number = 5): Promise<PostWithCounts[]> {
        return postRepository.getRelatedPosts(postId, limit);
    }
}

export const postUseCases = new PostUseCases();

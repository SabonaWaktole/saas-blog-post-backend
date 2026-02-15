// Post Repository Interface - Domain Layer
import { Post, CreatePostInput, UpdatePostInput, PostStatus, PostWithCounts } from '../entities/Post';

export interface PaginationOptions {
    page: number;
    limit: number;
}

export interface PostFilterOptions {
    status?: PostStatus;
    categoryId?: string;
    tagId?: string;
    search?: string;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface IPostRepository {
    findById(id: string): Promise<Post | null>;
    findBySlug(blogId: string, slug: string): Promise<PostWithCounts | null>;
    findByBlogId(
        blogId: string,
        options: PaginationOptions,
        filters?: PostFilterOptions
    ): Promise<PaginatedResult<PostWithCounts>>;
    findPublishedByBlogId(
        blogId: string,
        options: PaginationOptions
    ): Promise<PaginatedResult<PostWithCounts>>;
    findAllPublished(
        options: PaginationOptions,
        filters?: PostFilterOptions
    ): Promise<PaginatedResult<PostWithCounts>>;
    create(input: CreatePostInput): Promise<Post>;
    update(id: string, input: UpdatePostInput): Promise<Post>;
    updateStatus(id: string, status: PostStatus): Promise<Post>;
    bulkUpdateStatus(ids: string[], status: PostStatus): Promise<number>;
    delete(id: string): Promise<void>;
    isAuthor(postId: string, userId: string): Promise<boolean>;
    getRelatedPosts(postId: string, limit: number): Promise<PostWithCounts[]>;
    addCategories(postId: string, categoryIds: string[]): Promise<void>;
    removeCategories(postId: string, categoryIds: string[]): Promise<void>;
    clearCategories(postId: string): Promise<void>;
    addTags(postId: string, tagIds: string[]): Promise<void>;
    removeTags(postId: string, tagIds: string[]): Promise<void>;
    clearTags(postId: string): Promise<void>;
}

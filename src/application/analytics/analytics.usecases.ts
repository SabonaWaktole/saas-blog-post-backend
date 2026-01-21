// Analytics Use Cases
import { analyticsRepository, blogRepository, postRepository } from '../../infrastructure/repositories';
import {
    CreateReadTimeLogInput,
    PostAnalytics,
    BlogAnalytics,
    AuthorDashboardAnalytics
} from '../../domain/entities/Analytics';

export class AnalyticsUseCases {
    async trackReadTime(input: CreateReadTimeLogInput): Promise<void> {
        // Verify post exists and get blogId
        const post = await postRepository.findById(input.postId);
        if (!post) {
            throw new Error('Post not found');
        }

        await analyticsRepository.createReadTimeLog({
            ...input,
            blogId: post.blogId,
        });
    }

    async getPostAnalytics(postId: string, userId: string): Promise<PostAnalytics> {
        // Verify ownership
        const isAuthor = await postRepository.isAuthor(postId, userId);
        if (!isAuthor) {
            throw new Error('Unauthorized: You can only view analytics for your own posts');
        }

        return analyticsRepository.getPostAnalytics(postId);
    }

    async getBlogAnalytics(blogId: string, userId: string): Promise<BlogAnalytics> {
        const isOwner = await blogRepository.isOwner(blogId, userId);
        if (!isOwner) {
            throw new Error('Unauthorized: You can only view analytics for your own blogs');
        }

        return analyticsRepository.getBlogAnalytics(blogId);
    }

    async getAuthorDashboard(userId: string): Promise<AuthorDashboardAnalytics> {
        return analyticsRepository.getAuthorDashboard(userId);
    }
}

export const analyticsUseCases = new AnalyticsUseCases();

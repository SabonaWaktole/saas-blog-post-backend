// Analytics Repository Interface - Domain Layer
import {
    ReadTimeLog,
    CreateReadTimeLogInput,
    PostAnalytics,
    BlogAnalytics,
    AuthorDashboardAnalytics
} from '../entities/Analytics';

export interface IAnalyticsRepository {
    // Read time tracking
    createReadTimeLog(input: CreateReadTimeLogInput): Promise<ReadTimeLog>;

    // Post analytics (author only)
    getPostAnalytics(postId: string): Promise<PostAnalytics>;

    // Blog analytics (author only)
    getBlogAnalytics(blogId: string): Promise<BlogAnalytics>;

    // Author dashboard (cross-blog)
    getAuthorDashboard(userId: string): Promise<AuthorDashboardAnalytics>;
}

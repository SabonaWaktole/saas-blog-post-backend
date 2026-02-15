// Analytics Entities - Domain Layer

export interface ReadTimeLog {
    id: string;
    postId: string;
    blogId: string;
    userId: string | null;
    sessionId: string | null;
    readTimeSeconds: number;
    createdAt: Date;
}

export interface CreateReadTimeLogInput {
    postId: string;
    blogId: string;
    userId?: string;
    sessionId?: string;
    readTimeSeconds: number;
}

// Aggregated analytics for posts
export interface PostAnalytics {
    postId: string;
    totalReadTimeSeconds: number;
    uniqueReaders: number;
    likeCount: number;
    bookmarkCount: number;
    estimatedReadRate: number; // percentage of content read
}

// Aggregated analytics for blogs
export interface BlogAnalytics {
    blogId: string;
    totalReadTimeSeconds: number;
    totalLikes: number;
    totalPosts: number;
    topPosts: Array<{
        postId: string;
        title: string;
        likeCount: number;
        readTimeSeconds: number;
    }>;
}

// Author dashboard analytics
export interface AuthorDashboardAnalytics {
    totalLikes: number;
    totalFollowers: number;
    totalReadTimeSeconds: number;
    totalPosts: number;
    blogBreakdown: Array<{
        blogId: string;
        blogTitle: string;
        totalLikes: number;
        totalReadTimeSeconds: number;
        postCount: number;
    }>;
}

export interface Activity {
    id: string;
    type: 'LIKE' | 'FOLLOW' | 'COMMENT' | 'BOOKMARK';
    description: string;
    targetId: string; // postId or userId
    targetTitle?: string; // post title or user name
    actorId: string;
    actorName: string;
    actorAvatar?: string; // Optional
    createdAt: Date;
}

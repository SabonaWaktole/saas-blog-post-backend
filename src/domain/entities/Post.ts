// Post Entity - Domain Layer

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Post {
    id: string;
    slug: string;
    title: string;
    content: string;
    excerpt: string | null;
    coverImageUrl: string | null;
    featured: boolean;
    readTimeMinutes: number;
    status: PostStatus;
    publishedAt: Date | null;
    seoTitle: string | null;
    seoDescription: string | null;
    blogId: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
    category?: string; // ID for frontend
    tags?: string[]; // IDs for frontend
}

export interface CreatePostInput {
    slug: string;
    title: string;
    content: string;
    excerpt?: string;
    coverImageUrl?: string;
    featured?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    blogId: string;
    authorId: string;
}

export interface UpdatePostInput {
    slug?: string;
    title?: string;
    content?: string;
    excerpt?: string;
    coverImageUrl?: string;
    featured?: boolean;
    status?: PostStatus;
    seoTitle?: string;
    seoDescription?: string;
}

export interface PostWithCounts extends Post {
    likeCount: number;
    bookmarkCount: number;
    author?: { // Optional for list views
        id: string;
        email: string;
        avatarUrl?: string | null; // Needed for UI
    };
}

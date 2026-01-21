// Interaction Entities - Domain Layer

export interface Like {
    id: string;
    postId: string;
    userId: string | null;
    guestIp: string | null;
    createdAt: Date;
}

export interface CreateLikeInput {
    postId: string;
    userId?: string;
    guestIp?: string;
}

export interface Bookmark {
    id: string;
    postId: string;
    userId: string;
    createdAt: Date;
}

export interface CreateBookmarkInput {
    postId: string;
    userId: string;
}

export interface Follow {
    id: string;
    followerId: string;
    followingId: string;
    createdAt: Date;
}

export interface CreateFollowInput {
    followerId: string;
    followingId: string;
}

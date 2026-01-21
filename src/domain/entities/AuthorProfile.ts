// Author Profile Entity - Domain Layer

export interface AuthorProfile {
    id: string;
    userId: string;
    bio: string | null;
    location: string | null;
    avatarUrl: string | null;
    website: string | null;
    twitter: string | null;
    github: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateAuthorProfileInput {
    userId: string;
    bio?: string;
    location?: string;
    avatarUrl?: string;
    website?: string;
    twitter?: string;
    github?: string;
}

export interface UpdateAuthorProfileInput {
    bio?: string;
    location?: string;
    avatarUrl?: string;
    website?: string;
    twitter?: string;
    github?: string;
}

export interface PublicAuthorProfile {
    id: string;
    bio: string | null;
    location: string | null;
    avatarUrl: string | null;
    website: string | null;
    twitter: string | null;
    github: string | null;
    postCount: number;
    followerCount: number;
    followingCount: number;
}

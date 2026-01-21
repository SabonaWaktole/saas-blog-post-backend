// Interaction Repository Interface - Domain Layer
import { Like, CreateLikeInput, Bookmark, CreateBookmarkInput, Follow, CreateFollowInput } from '../entities/Interaction';

export interface IInteractionRepository {
    // Likes
    findLike(postId: string, userId?: string, guestIp?: string): Promise<Like | null>;
    createLike(input: CreateLikeInput): Promise<Like>;
    deleteLike(postId: string, userId?: string, guestIp?: string): Promise<void>;
    getLikeCount(postId: string): Promise<number>;

    // Bookmarks
    findBookmark(postId: string, userId: string): Promise<Bookmark | null>;
    createBookmark(input: CreateBookmarkInput): Promise<Bookmark>;
    deleteBookmark(postId: string, userId: string): Promise<void>;
    getBookmarkCount(postId: string): Promise<number>;
    getUserBookmarks(userId: string): Promise<Bookmark[]>;

    // Follows
    findFollow(followerId: string, followingId: string): Promise<Follow | null>;
    createFollow(input: CreateFollowInput): Promise<Follow>;
    deleteFollow(followerId: string, followingId: string): Promise<void>;
    getFollowerCount(userId: string): Promise<number>;
    getFollowingCount(userId: string): Promise<number>;
    getFollowers(userId: string): Promise<Follow[]>;
    getFollowing(userId: string): Promise<Follow[]>;
}

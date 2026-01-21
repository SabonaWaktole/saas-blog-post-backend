// Interaction Use Cases (Likes, Bookmarks, Follows)
import { interactionRepository, postRepository, userRepository } from '../../infrastructure/repositories';
import { Like, Bookmark, Follow } from '../../domain/entities/Interaction';

export class InteractionUseCases {
    // ============== Likes ==============

    async likePost(postId: string, userId?: string, guestIp?: string): Promise<Like> {
        // Verify post exists
        const post = await postRepository.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }

        // Check for duplicate
        const existing = await interactionRepository.findLike(postId, userId, guestIp);
        if (existing) {
            throw new Error('Already liked');
        }

        return interactionRepository.createLike({ postId, userId, guestIp });
    }

    async unlikePost(postId: string, userId?: string, guestIp?: string): Promise<void> {
        const existing = await interactionRepository.findLike(postId, userId, guestIp);
        if (!existing) {
            throw new Error('Like not found');
        }

        await interactionRepository.deleteLike(postId, userId, guestIp);
    }

    async getLikeCount(postId: string): Promise<number> {
        return interactionRepository.getLikeCount(postId);
    }

    async hasLiked(postId: string, userId?: string, guestIp?: string): Promise<boolean> {
        const like = await interactionRepository.findLike(postId, userId, guestIp);
        return !!like;
    }

    // ============== Bookmarks ==============

    async bookmarkPost(postId: string, userId: string): Promise<Bookmark> {
        const post = await postRepository.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }

        const existing = await interactionRepository.findBookmark(postId, userId);
        if (existing) {
            throw new Error('Already bookmarked');
        }

        return interactionRepository.createBookmark({ postId, userId });
    }

    async removeBookmark(postId: string, userId: string): Promise<void> {
        const existing = await interactionRepository.findBookmark(postId, userId);
        if (!existing) {
            throw new Error('Bookmark not found');
        }

        await interactionRepository.deleteBookmark(postId, userId);
    }

    async getBookmarkCount(postId: string): Promise<number> {
        return interactionRepository.getBookmarkCount(postId);
    }

    async hasBookmarked(postId: string, userId: string): Promise<boolean> {
        const bookmark = await interactionRepository.findBookmark(postId, userId);
        return !!bookmark;
    }

    async getUserBookmarks(userId: string): Promise<Bookmark[]> {
        return interactionRepository.getUserBookmarks(userId);
    }

    // ============== Follows ==============

    async followAuthor(followerId: string, authorId: string): Promise<Follow> {
        if (followerId === authorId) {
            throw new Error('Cannot follow yourself');
        }

        // Verify author exists
        const author = await userRepository.findById(authorId);
        if (!author) {
            throw new Error('Author not found');
        }

        const existing = await interactionRepository.findFollow(followerId, authorId);
        if (existing) {
            throw new Error('Already following');
        }

        return interactionRepository.createFollow({ followerId, followingId: authorId });
    }

    async unfollowAuthor(followerId: string, authorId: string): Promise<void> {
        const existing = await interactionRepository.findFollow(followerId, authorId);
        if (!existing) {
            throw new Error('Not following');
        }

        await interactionRepository.deleteFollow(followerId, authorId);
    }

    async getFollowerCount(userId: string): Promise<number> {
        return interactionRepository.getFollowerCount(userId);
    }

    async getFollowingCount(userId: string): Promise<number> {
        return interactionRepository.getFollowingCount(userId);
    }

    async isFollowing(followerId: string, authorId: string): Promise<boolean> {
        const follow = await interactionRepository.findFollow(followerId, authorId);
        return !!follow;
    }

    async getFollowers(userId: string): Promise<Follow[]> {
        return interactionRepository.getFollowers(userId);
    }

    async getFollowing(userId: string): Promise<Follow[]> {
        return interactionRepository.getFollowing(userId);
    }
}

export const interactionUseCases = new InteractionUseCases();

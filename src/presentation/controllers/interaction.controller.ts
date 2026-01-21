// Interaction Controller (Likes, Bookmarks, Follows)
import { Request, Response } from 'express';
import { interactionUseCases } from '../../application/interactions';

export class InteractionController {
    // Likes
    async likePost(req: Request, res: Response): Promise<void> {
        const { postId } = req.params;
        const userId = req.user?.userId;
        const guestIp = req.guestIp;

        const like = await interactionUseCases.likePost(postId, userId, guestIp);
        res.status(201).json(like);
    }

    async unlikePost(req: Request, res: Response): Promise<void> {
        const { postId } = req.params;
        const userId = req.user?.userId;
        const guestIp = req.guestIp;

        await interactionUseCases.unlikePost(postId, userId, guestIp);
        res.status(204).send();
    }

    async getLikeStatus(req: Request, res: Response): Promise<void> {
        const { postId } = req.params;
        const userId = req.user?.userId;
        const guestIp = req.guestIp;

        const [hasLiked, count] = await Promise.all([
            interactionUseCases.hasLiked(postId, userId, guestIp),
            interactionUseCases.getLikeCount(postId),
        ]);

        res.json({ hasLiked, count });
    }

    // Bookmarks
    async bookmarkPost(req: Request, res: Response): Promise<void> {
        const { postId } = req.params;
        const userId = req.user!.userId;

        const bookmark = await interactionUseCases.bookmarkPost(postId, userId);
        res.status(201).json(bookmark);
    }

    async removeBookmark(req: Request, res: Response): Promise<void> {
        const { postId } = req.params;
        const userId = req.user!.userId;

        await interactionUseCases.removeBookmark(postId, userId);
        res.status(204).send();
    }

    async getBookmarkStatus(req: Request, res: Response): Promise<void> {
        const { postId } = req.params;
        const userId = req.user!.userId;

        const [hasBookmarked, count] = await Promise.all([
            interactionUseCases.hasBookmarked(postId, userId),
            interactionUseCases.getBookmarkCount(postId),
        ]);

        res.json({ hasBookmarked, count });
    }

    async getMyBookmarks(req: Request, res: Response): Promise<void> {
        const userId = req.user!.userId;
        const bookmarks = await interactionUseCases.getUserBookmarks(userId);
        res.json(bookmarks);
    }

    // Follows
    async followAuthor(req: Request, res: Response): Promise<void> {
        const { authorId } = req.params;
        const followerId = req.user!.userId;

        const follow = await interactionUseCases.followAuthor(followerId, authorId);
        res.status(201).json(follow);
    }

    async unfollowAuthor(req: Request, res: Response): Promise<void> {
        const { authorId } = req.params;
        const followerId = req.user!.userId;

        await interactionUseCases.unfollowAuthor(followerId, authorId);
        res.status(204).send();
    }

    async getFollowStatus(req: Request, res: Response): Promise<void> {
        const { authorId } = req.params;
        const followerId = req.user!.userId;

        const [isFollowing, followerCount] = await Promise.all([
            interactionUseCases.isFollowing(followerId, authorId),
            interactionUseCases.getFollowerCount(authorId),
        ]);

        res.json({ isFollowing, followerCount });
    }

    async getFollowers(req: Request, res: Response): Promise<void> {
        const userId = req.user!.userId;
        const followers = await interactionUseCases.getFollowers(userId);
        res.json(followers);
    }

    async getFollowing(req: Request, res: Response): Promise<void> {
        const userId = req.user!.userId;
        const following = await interactionUseCases.getFollowing(userId);
        res.json(following);
    }
}

export const interactionController = new InteractionController();

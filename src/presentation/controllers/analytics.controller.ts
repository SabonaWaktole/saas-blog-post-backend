// Analytics Controller
import { Request, Response } from 'express';
import { analyticsUseCases } from '../../application/analytics';

export class AnalyticsController {
    async trackReadTime(req: Request, res: Response): Promise<void> {
        const { postId, readTimeSeconds, sessionId } = req.body;
        const userId = req.user?.userId;

        await analyticsUseCases.trackReadTime({
            postId,
            blogId: '', // Will be filled by use case
            readTimeSeconds,
            userId,
            sessionId,
        });

        res.status(204).send();
    }

    async getPostAnalytics(req: Request, res: Response): Promise<void> {
        const { postId } = req.params;
        const userId = req.user!.userId;

        const analytics = await analyticsUseCases.getPostAnalytics(postId, userId);
        res.json(analytics);
    }

    async getBlogAnalytics(req: Request, res: Response): Promise<void> {
        const { blogId } = req.params;
        const userId = req.user!.userId;

        const analytics = await analyticsUseCases.getBlogAnalytics(blogId, userId);
        res.json(analytics);
    }

    async getDashboard(req: Request, res: Response): Promise<void> {
        const userId = req.user!.userId;
        const dashboard = await analyticsUseCases.getAuthorDashboard(userId);
        res.json(dashboard);
    }
}

export const analyticsController = new AnalyticsController();

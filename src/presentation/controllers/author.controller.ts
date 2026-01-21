// Author Profile Controller
import { Request, Response } from 'express';
import { authorProfileRepository } from '../../infrastructure/repositories';

export class AuthorController {
    async getPublicProfile(req: Request, res: Response): Promise<void> {
        const { authorId } = req.params;
        const profile = await authorProfileRepository.getPublicProfile(authorId);

        if (!profile) {
            res.status(404).json({ error: 'Author profile not found' });
            return;
        }

        res.json(profile);
    }

    async getMyProfile(req: Request, res: Response): Promise<void> {
        const userId = req.user!.userId;
        const profile = await authorProfileRepository.findByUserId(userId);

        if (!profile) {
            res.status(404).json({ error: 'Profile not found' });
            return;
        }

        res.json(profile);
    }

    async updateProfile(req: Request, res: Response): Promise<void> {
        const userId = req.user!.userId;

        // Check if profile exists
        let profile = await authorProfileRepository.findByUserId(userId);

        if (!profile) {
            // Create profile if doesn't exist
            profile = await authorProfileRepository.create({
                userId,
                ...req.body,
            });
        } else {
            profile = await authorProfileRepository.update(userId, req.body);
        }

        res.json(profile);
    }
}

export const authorController = new AuthorController();

// Upload Controller
import { Request, Response } from 'express';
import { uploadUseCases } from '../../application/uploads';

export class UploadController {
    async uploadBlogLogo(req: Request, res: Response): Promise<void> {
        const { blogId } = req.params;
        const userId = req.user!.userId;
        const file = req.file;

        if (!file) {
            res.status(400).json({ error: 'No file provided' });
            return;
        }

        const result = await uploadUseCases.uploadBlogLogo(
            blogId,
            userId,
            file.originalname,
            file.buffer,
            file.mimetype
        );

        res.json(result);
    }

    async uploadAvatar(req: Request, res: Response): Promise<void> {
        const userId = req.user!.userId;
        const file = req.file;

        if (!file) {
            res.status(400).json({ error: 'No file provided' });
            return;
        }

        const result = await uploadUseCases.uploadAvatar(
            userId,
            file.originalname,
            file.buffer,
            file.mimetype
        );

        res.json(result);
    }

    async uploadPostCover(req: Request, res: Response): Promise<void> {
        const { blogId } = req.params;
        const userId = req.user!.userId;
        const file = req.file;

        if (!file) {
            res.status(400).json({ error: 'No file provided' });
            return;
        }

        const result = await uploadUseCases.uploadPostCover(
            blogId,
            userId,
            file.originalname,
            file.buffer,
            file.mimetype
        );

        res.json(result);
    }
}

export const uploadController = new UploadController();

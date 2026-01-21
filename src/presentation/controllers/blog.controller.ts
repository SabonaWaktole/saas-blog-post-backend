// Blog Controller
import { Request, Response } from 'express';
import { blogUseCases } from '../../application/blogs';

export class BlogController {
    async create(req: Request, res: Response): Promise<void> {
        const userId = req.user!.userId;
        const blog = await blogUseCases.create(userId, req.body);
        res.status(201).json(blog);
    }

    async update(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const userId = req.user!.userId;
        const blog = await blogUseCases.update(id, userId, req.body);
        res.json(blog);
    }

    async delete(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const userId = req.user!.userId;
        await blogUseCases.delete(id, userId);
        res.status(204).send();
    }

    async getBySlug(req: Request, res: Response): Promise<void> {
        const { slug } = req.params;
        const blog = await blogUseCases.getBySlug(slug);
        if (!blog) {
            res.status(404).json({ error: 'Blog not found' });
            return;
        }
        res.json(blog);
    }

    async listMy(req: Request, res: Response): Promise<void> {
        const userId = req.user!.userId;
        const blogs = await blogUseCases.listByOwner(userId);
        res.json(blogs);
    }
}

export const blogController = new BlogController();

// Taxonomy Controller (Categories & Tags)
import { Request, Response } from 'express';
import { taxonomyUseCases } from '../../application/taxonomy';

export class TaxonomyController {
    // Categories
    async createCategory(req: Request, res: Response): Promise<void> {
        const { blogId } = req.params;
        const userId = req.user!.userId;
        const category = await taxonomyUseCases.createCategory(blogId, userId, req.body);
        res.status(201).json(category);
    }

    async updateCategory(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const userId = req.user!.userId;
        const category = await taxonomyUseCases.updateCategory(id, userId, req.body);
        res.json(category);
    }

    async deleteCategory(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const userId = req.user!.userId;
        await taxonomyUseCases.deleteCategory(id, userId);
        res.status(204).send();
    }

    async getCategoriesByBlog(req: Request, res: Response): Promise<void> {
        const { blogId } = req.params;
        const categories = await taxonomyUseCases.getCategoriesByBlog(blogId);
        res.json(categories);
    }

    async getCategoriesHierarchy(req: Request, res: Response): Promise<void> {
        const { blogId } = req.params;
        const hierarchy = await taxonomyUseCases.getCategoriesHierarchy(blogId);
        res.json(hierarchy);
    }

    // Tags
    async createTag(req: Request, res: Response): Promise<void> {
        const { blogId } = req.params;
        const userId = req.user!.userId;
        const tag = await taxonomyUseCases.createTag(blogId, userId, req.body);
        res.status(201).json(tag);
    }

    async deleteTag(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const userId = req.user!.userId;
        await taxonomyUseCases.deleteTag(id, userId);
        res.status(204).send();
    }

    async getTagsByBlog(req: Request, res: Response): Promise<void> {
        const { blogId } = req.params;
        const tags = await taxonomyUseCases.getTagsByBlog(blogId);
        res.json(tags);
    }
}

export const taxonomyController = new TaxonomyController();

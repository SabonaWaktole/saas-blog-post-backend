// Post Controller
import { Request, Response } from 'express';
import { postUseCases } from '../../application/posts';

export class PostController {
    async create(req: Request, res: Response): Promise<void> {
        const { blogId } = req.params;
        const userId = req.user!.userId;
        const post = await postUseCases.create(blogId, userId, req.body);
        res.status(201).json(post);
    }

    async update(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const userId = req.user!.userId;
        const post = await postUseCases.update(id, userId, req.body);
        res.json(post);
    }

    async publish(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const userId = req.user!.userId;
        const post = await postUseCases.publish(id, userId);
        res.json(post);
    }

    async archive(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const userId = req.user!.userId;
        const post = await postUseCases.archive(id, userId);
        res.json(post);
    }

    async unpublish(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const userId = req.user!.userId;
        const post = await postUseCases.unpublish(id, userId);
        res.json(post);
    }

    async bulkUpdateStatus(req: Request, res: Response): Promise<void> {
        const { postIds, status } = req.body;
        const userId = req.user!.userId;
        const count = await postUseCases.bulkUpdateStatus(postIds, status, userId);
        res.json({ updated: count });
    }

    async delete(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const userId = req.user!.userId;
        await postUseCases.delete(id, userId);
        res.status(204).send();
    }

    async getBySlug(req: Request, res: Response): Promise<void> {
        const { blogSlug, postSlug } = req.params;
        // First get blog by slug
        const { blogUseCases } = await import('../../application/blogs');
        const blog = await blogUseCases.getBySlug(blogSlug);
        if (!blog) {
            res.status(404).json({ error: 'Blog not found' });
            return;
        }

        const post = await postUseCases.getBySlug(blog.id, postSlug);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        res.json(post);
    }

    async listByBlog(req: Request, res: Response): Promise<void> {
        const { blogId } = req.params;
        const { page, limit, status, categoryId, tagId } = req.query;

        const options = {
            page: parseInt(page as string) || 1,
            limit: parseInt(limit as string) || 20,
        };

        const filters = {
            status: status as any,
            categoryId: categoryId as string,
            tagId: tagId as string,
        };

        const result = await postUseCases.listByBlog(blogId, options, filters);
        res.json(result);
    }

    async listPublished(req: Request, res: Response): Promise<void> {
        const { blogSlug } = req.params;
        const { page, limit } = req.query;

        const { blogUseCases } = await import('../../application/blogs');
        const blog = await blogUseCases.getBySlug(blogSlug);
        if (!blog) {
            res.status(404).json({ error: 'Blog not found' });
            return;
        }

        const options = {
            page: parseInt(page as string) || 1,
            limit: parseInt(limit as string) || 20,
        };

        const result = await postUseCases.listPublishedByBlog(blog.id, options);
        res.json(result);
    }

    async listAllPublished(req: Request, res: Response): Promise<void> {
        const { page, limit, search, categoryId } = req.query;

        const options = {
            page: parseInt(page as string) || 1,
            limit: parseInt(limit as string) || 20,
        };

        const filters = {
            search: search as string,
            categoryId: categoryId as string,
        };

        const result = await postUseCases.listAllPublished(options, filters);
        res.json(result);
    }

    async getRelated(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const limit = parseInt(req.query.limit as string) || 5;
        const posts = await postUseCases.getRelatedPosts(id, limit);
        res.json(posts);
    }
    async getById(req: Request, res: Response): Promise<void> {
        const { blogId, id } = req.params;
        const userId = req.user!.userId;

        // Use a use case that checks permissions if needed, or just fetch if owner/author
        // For editing, we typically want the raw post data.
        // Let's rely on repository finding it, and maybe check ownership if necessary.
        // The repository findById doesn't check blogId, so we should probably verify it matches.

        const post = await postUseCases.getById(id);

        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        // Optional: specific check if post belongs to blog
        if (post.blogId !== blogId) {
            res.status(404).json({ error: 'Post not found in this blog' });
            return;
        }

        res.json(post);
    }
}

export const postController = new PostController();

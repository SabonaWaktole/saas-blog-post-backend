// Taxonomy Use Cases (Categories & Tags)
import { categoryRepository, tagRepository, blogRepository } from '../../infrastructure/repositories';
import { Category, CreateCategoryInput, UpdateCategoryInput, CategoryWithChildren } from '../../domain/entities/Category';
import { Tag, CreateTagInput } from '../../domain/entities/Tag';

export class TaxonomyUseCases {
    // ============== Categories ==============

    async createCategory(
        blogId: string,
        userId: string,
        input: Omit<CreateCategoryInput, 'blogId'>
    ): Promise<Category> {
        const isOwner = await blogRepository.isOwner(blogId, userId);
        if (!isOwner) {
            throw new Error('Unauthorized: You do not own this blog');
        }

        // Check slug uniqueness within blog
        const existing = await categoryRepository.findBySlug(blogId, input.slug);
        if (existing) {
            throw new Error('Category slug already exists in this blog');
        }

        return categoryRepository.create({ ...input, blogId });
    }

    async updateCategory(
        categoryId: string,
        userId: string,
        input: UpdateCategoryInput
    ): Promise<Category> {
        const category = await categoryRepository.findById(categoryId);
        if (!category) {
            throw new Error('Category not found');
        }

        const isOwner = await blogRepository.isOwner(category.blogId, userId);
        if (!isOwner) {
            throw new Error('Unauthorized: You do not own this blog');
        }

        return categoryRepository.update(categoryId, input);
    }

    async deleteCategory(categoryId: string, userId: string): Promise<void> {
        const category = await categoryRepository.findById(categoryId);
        if (!category) {
            throw new Error('Category not found');
        }

        const isOwner = await blogRepository.isOwner(category.blogId, userId);
        if (!isOwner) {
            throw new Error('Unauthorized: You do not own this blog');
        }

        await categoryRepository.delete(categoryId);
    }

    async getCategoriesByBlog(blogId: string): Promise<Category[]> {
        return categoryRepository.findByBlogId(blogId);
    }

    async getCategoriesHierarchy(blogId: string): Promise<CategoryWithChildren[]> {
        return categoryRepository.findByBlogIdWithChildren(blogId);
    }

    // ============== Tags ==============

    async createTag(
        blogId: string,
        userId: string,
        input: Omit<CreateTagInput, 'blogId'>
    ): Promise<Tag> {
        const isOwner = await blogRepository.isOwner(blogId, userId);
        if (!isOwner) {
            throw new Error('Unauthorized: You do not own this blog');
        }

        // Check slug uniqueness
        const existing = await tagRepository.findBySlug(blogId, input.slug);
        if (existing) {
            throw new Error('Tag slug already exists in this blog');
        }

        return tagRepository.create({ ...input, blogId });
    }

    async deleteTag(tagId: string, userId: string): Promise<void> {
        const tag = await tagRepository.findById(tagId);
        if (!tag) {
            throw new Error('Tag not found');
        }

        const isOwner = await blogRepository.isOwner(tag.blogId, userId);
        if (!isOwner) {
            throw new Error('Unauthorized: You do not own this blog');
        }

        await tagRepository.delete(tagId);
    }

    async getTagsByBlog(blogId: string): Promise<Tag[]> {
        return tagRepository.findByBlogId(blogId);
    }
}

export const taxonomyUseCases = new TaxonomyUseCases();

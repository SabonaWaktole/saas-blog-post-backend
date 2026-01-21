// Category Entity - Domain Layer
// Hierarchical categories per blog

export interface Category {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    parentId: string | null;
    blogId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCategoryInput {
    slug: string;
    name: string;
    description?: string;
    parentId?: string;
    blogId: string;
}

export interface UpdateCategoryInput {
    name?: string;
    description?: string;
    parentId?: string | null;
}

export interface CategoryWithChildren extends Category {
    children: Category[];
}

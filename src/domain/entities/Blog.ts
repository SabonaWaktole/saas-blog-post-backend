// Blog Entity - Domain Layer
// Represents a tenant in the multi-tenant system

export interface Blog {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    logoUrl: string | null;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateBlogInput {
    slug: string;
    title: string;
    description?: string;
    logoUrl?: string;
    ownerId: string;
}

export interface UpdateBlogInput {
    title?: string;
    description?: string;
    logoUrl?: string;
}

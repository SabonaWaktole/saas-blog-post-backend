// Tag Entity - Domain Layer
// Global tags scoped per blog

export interface Tag {
    id: string;
    slug: string;
    name: string;
    blogId: string;
    createdAt: Date;
}

export interface CreateTagInput {
    slug: string;
    name: string;
    blogId: string;
}

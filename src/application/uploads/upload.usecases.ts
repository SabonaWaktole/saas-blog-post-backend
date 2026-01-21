// Upload Use Cases
import { storageService, BucketType } from '../../infrastructure/supabase';
import { blogRepository } from '../../infrastructure/repositories';

export interface UploadResult {
    url: string;
    path: string;
}

export class UploadUseCases {
    async uploadBlogLogo(
        blogId: string,
        userId: string,
        fileName: string,
        file: Buffer,
        contentType: string
    ): Promise<UploadResult> {
        const isOwner = await blogRepository.isOwner(blogId, userId);
        if (!isOwner) {
            throw new Error('Unauthorized: You do not own this blog');
        }

        const result = await storageService.upload('blogs', `${blogId}/${fileName}`, file, contentType);
        return { url: result.publicUrl, path: result.path };
    }

    async uploadAvatar(
        userId: string,
        fileName: string,
        file: Buffer,
        contentType: string
    ): Promise<UploadResult> {
        const result = await storageService.upload('avatars', `${userId}/${fileName}`, file, contentType);
        return { url: result.publicUrl, path: result.path };
    }

    async uploadPostCover(
        blogId: string,
        userId: string,
        fileName: string,
        file: Buffer,
        contentType: string
    ): Promise<UploadResult> {
        const isOwner = await blogRepository.isOwner(blogId, userId);
        if (!isOwner) {
            throw new Error('Unauthorized: You do not own this blog');
        }

        const result = await storageService.upload('covers', `${blogId}/${fileName}`, file, contentType);
        return { url: result.publicUrl, path: result.path };
    }

    async deleteFile(type: BucketType, path: string): Promise<void> {
        await storageService.delete(type, path);
    }
}

export const uploadUseCases = new UploadUseCases();

// Supabase Storage Service
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../../config';

export type BucketType = 'blogs' | 'avatars' | 'covers';

export interface UploadResult {
    path: string;
    publicUrl: string;
}

export class StorageService {
    private client: SupabaseClient;

    constructor() {
        if (!config.supabase.url || !config.supabase.key) {
            console.warn('Supabase credentials not configured. File uploads will fail.');
        }
        this.client = createClient(config.supabase.url, config.supabase.key);
    }

    private getBucketName(type: BucketType): string {
        return config.supabase.buckets[type];
    }

    async upload(
        type: BucketType,
        fileName: string,
        file: Buffer,
        contentType: string
    ): Promise<UploadResult> {
        const bucket = this.getBucketName(type);
        const path = `${Date.now()}-${fileName}`;

        const { data, error } = await this.client.storage
            .from(bucket)
            .upload(path, file, {
                contentType,
                upsert: false,
            });

        if (error) {
            throw new Error(`Failed to upload file: ${error.message}`);
        }

        const { data: urlData } = this.client.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return {
            path: data.path,
            publicUrl: urlData.publicUrl,
        };
    }

    async delete(type: BucketType, path: string): Promise<void> {
        const bucket = this.getBucketName(type);

        const { error } = await this.client.storage
            .from(bucket)
            .remove([path]);

        if (error) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }

    getPublicUrl(type: BucketType, path: string): string {
        const bucket = this.getBucketName(type);
        const { data } = this.client.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    }
}

export const storageService = new StorageService();

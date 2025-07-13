import { API_URL } from '../config/constants';

class FileStreamService {
    private blobCache = new Map<string, string>();

    /**
     * Lấy blob URL từ file_url
     * @param fileUrl - URL của file (có thể là đường dẫn local hoặc URL external)
     * @returns Promise<string> - Blob URL
     */
    async getBlobUrl(fileUrl: string): Promise<string> {
        // Kiểm tra cache trước
        if (this.blobCache.has(fileUrl)) {
            return this.blobCache.get(fileUrl)!;
        }

        try {
            let response: Response;

            // Kiểm tra xem có phải là file local không
            if (fileUrl.startsWith('uploads/')) {
                // File local - gọi API stream
                const filename = fileUrl.split('/').pop();
                response = await fetch(`${API_URL}/chat/stream/${filename}`);
            } else {
                // File external - fetch trực tiếp
                response = await fetch(fileUrl);
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            // Cache blob URL
            this.blobCache.set(fileUrl, blobUrl);

            return blobUrl;
        } catch (error) {
            console.error('Error getting blob URL:', error);
            throw error;
        }
    }

    /**
     * Xóa blob URL khỏi cache và revoke
     * @param fileUrl - URL của file
     */
    revokeBlobUrl(fileUrl: string): void {
        const blobUrl = this.blobCache.get(fileUrl);
        if (blobUrl) {
            URL.revokeObjectURL(blobUrl);
            this.blobCache.delete(fileUrl);
        }
    }

    /**
     * Xóa tất cả blob URLs
     */
    clearCache(): void {
        this.blobCache.forEach(blobUrl => {
            URL.revokeObjectURL(blobUrl);
        });
        this.blobCache.clear();
    }

    /**
     * Kiểm tra xem message có phải là file/image không
     * @param message - Message object
     * @returns boolean
     */
    isFileMessage(message: any): boolean {
        return message.message_type === 'file' || message.message_type === 'image';
    }

    /**
     * Lấy filename từ file_url
     * @param fileUrl - URL của file
     * @returns string - filename
     */
    getFilenameFromUrl(fileUrl: string): string {
        if (fileUrl.startsWith('uploads/')) {
            return fileUrl.split('/').pop() || '';
        }
        return fileUrl.split('/').pop() || '';
    }
}

export default new FileStreamService(); 
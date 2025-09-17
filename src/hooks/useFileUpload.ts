import { useState, useCallback } from 'react';

interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

interface UseFileUploadOptions {
    maxSize?: number; // in MB
    allowedTypes?: string[];
    compressImages?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
}

interface UseFileUploadReturn {
    uploadFile: (file: File) => Promise<string>;
    uploadProgress: UploadProgress | null;
    isUploading: boolean;
    error: string | null;
    compressImage: (file: File) => Promise<File>;
}

export const useFileUpload = (options: UseFileUploadOptions = {}): UseFileUploadReturn => {
    const {
        maxSize = 10, // 10MB default
        allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
        compressImages = true,
        maxWidth = 1920,
        maxHeight = 1920,
        quality = 0.8
    } = options;

    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Compress image function
    const compressImage = useCallback(async (file: File): Promise<File> => {
        if (!compressImages || !file.type.startsWith('image/')) {
            return file;
        }

        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx?.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    },
                    file.type,
                    quality
                );
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    }, [compressImages, maxWidth, maxHeight, quality]);

    // Upload file function
    const uploadFile = useCallback(async (file: File): Promise<string> => {
        setError(null);
        setIsUploading(true);
        setUploadProgress(null);

        try {
            // Validate file type
            if (!allowedTypes.includes(file.type)) {
                throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
            }

            // Validate file size (before compression)
            if (file.size > maxSize * 1024 * 1024) {
                throw new Error(`File size must be less than ${maxSize}MB`);
            }

            // Compress image if needed
            const processedFile = await compressImage(file);

            // Create form data
            const formData = new FormData();
            formData.append('file', processedFile);

            // Upload with progress tracking
            const response = await fetch('/api/upload/profile-photo', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const result = await response.json();
            return result.fileUrl;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Upload failed';
            setError(errorMessage);
            throw err;
        } finally {
            setIsUploading(false);
            setUploadProgress(null);
        }
    }, [maxSize, allowedTypes, compressImage]);

    return {
        uploadFile,
        uploadProgress,
        isUploading,
        error,
        compressImage
    };
};


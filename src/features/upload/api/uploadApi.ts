import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../app/api';

export interface UploadResponse {
    message: string;
    fileUrl: string;
    filename: string;
}

export interface AdditionalPhotoResponse extends UploadResponse {
    photoSlot: string;
}

// Upload profile photo
export const uploadProfilePhoto = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload/profile-photo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            console.log(`Upload Progress: ${percentCompleted}%`);
        },
    });

    return response.data;
};

// Upload additional photo
export const uploadAdditionalPhoto = async (file: File, photoSlot?: number): Promise<AdditionalPhotoResponse> => {
    console.log('Starting additional photo upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        photoSlot: photoSlot
    });

    const formData = new FormData();
    formData.append('file', file);
    if (photoSlot !== undefined) {
        formData.append('photoSlot', photoSlot.toString());
    }

    const token = localStorage.getItem('token');
    console.log('Auth token:', token ? 'Present' : 'Missing');
    console.log('Token value:', token ? token.substring(0, 20) + '...' : 'None');

    const response = await api.post('/upload/additional-photo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            console.log(`Upload Progress: ${percentCompleted}%`);
        },
    });

    console.log('Upload response:', response.data);
    return response.data;
};

// Delete photo
export const deletePhoto = async (photoType: 'profile' | 'additional', photoSlot?: string): Promise<void> => {
    await api.delete(`/upload/photo/${photoType}`, {
        data: { photoSlot }
    });
};

// Hooks
export const useUploadProfilePhoto = () => {
    const queryClient = useQueryClient();
    
    return useMutation<UploadResponse, Error, File>({
        mutationFn: uploadProfilePhoto,
        onSuccess: () => {
            // Invalidate user profile queries to refresh the UI
            queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
        },
        onError: (error) => {
            console.error('Failed to upload profile photo:', error);
            throw error;
        }
    });
};

export const useUploadAdditionalPhoto = () => {
    const queryClient = useQueryClient();
    
    return useMutation<AdditionalPhotoResponse, Error, { file: File; photoSlot?: number }>({
        mutationFn: ({ file, photoSlot }) => uploadAdditionalPhoto(file, photoSlot),
        onSuccess: () => {
            // Invalidate user profile queries to refresh the UI
            queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
        },
        onError: (error) => {
            console.error('Failed to upload additional photo:', error);
            throw error;
        }
    });
};

export const useDeletePhoto = () => {
    const queryClient = useQueryClient();
    
    return useMutation<void, Error, { photoType: 'profile' | 'additional', photoSlot?: string }>({
        mutationFn: ({ photoType, photoSlot }) => deletePhoto(photoType, photoSlot),
        onSuccess: () => {
            // Invalidate user profile queries to refresh the UI
            queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
        },
        onError: (error) => {
            console.error('Failed to delete photo:', error);
            throw error;
        }
    });
};

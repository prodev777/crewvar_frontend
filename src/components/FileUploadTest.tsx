import { useState } from 'react';
import { ProfilePhotoUpload } from './ProfilePhotoUpload';
import { AdditionalPhotoUpload } from './AdditionalPhotoUpload';

export const FileUploadTest = () => {
    const [profilePhoto, setProfilePhoto] = useState<string>('');
    const [additionalPhotos, setAdditionalPhotos] = useState<string[]>(['', '', '']);

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">File Upload Test</h1>
            
            <div className="space-y-8">
                {/* Profile Photo Test */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Profile Photo Upload</h2>
                    <div className="flex items-center space-x-4">
                        <ProfilePhotoUpload
                            currentPhoto={profilePhoto}
                            onPhotoChange={setProfilePhoto}
                            size="large"
                        />
                        <div>
                            <p className="text-sm text-gray-600">
                                Current photo: {profilePhoto ? 'Uploaded' : 'None'}
                            </p>
                            {profilePhoto && (
                                <p className="text-xs text-gray-500 mt-1">
                                    URL: {profilePhoto.substring(0, 50)}...
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Photos Test */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Additional Photos Upload</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {additionalPhotos.map((photo, index) => (
                            <div key={index}>
                                <AdditionalPhotoUpload
                                    currentPhoto={photo}
                                    onPhotoChange={(photoUrl) => {
                                        const newPhotos = [...additionalPhotos];
                                        newPhotos[index] = photoUrl;
                                        setAdditionalPhotos(newPhotos);
                                    }}
                                    onPhotoDelete={() => {
                                        const newPhotos = [...additionalPhotos];
                                        newPhotos[index] = '';
                                        setAdditionalPhotos(newPhotos);
                                    }}
                                    index={index}
                                />
                                <p className="text-xs text-center mt-2">
                                    Photo {index + 1}: {photo ? 'Uploaded' : 'Empty'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upload Instructions */}
                <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">How to Test:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Click on any upload area or drag & drop an image file</li>
                        <li>Supported formats: JPEG, PNG, WebP</li>
                        <li>Maximum file size: 10MB</li>
                        <li>Images will be automatically compressed for optimal performance</li>
                        <li>Check the browser console for upload progress and errors</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

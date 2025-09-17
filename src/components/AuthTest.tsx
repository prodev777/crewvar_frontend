import { useState } from 'react';
import { api } from '../app/api';

export const AuthTest = () => {
    const [result, setResult] = useState<string>('');

    const testAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Token:', token ? 'Present' : 'Missing');
            
            if (!token) {
                setResult('❌ No token found - User not logged in');
                return;
            }

            // Test a simple authenticated request
            const response = await api.get('/users/profile');
            console.log('Auth test response:', response.data);
            setResult('✅ Authentication working - User is logged in');
        } catch (error: any) {
            console.error('Auth test error:', error);
            setResult(`❌ Authentication failed: ${error.response?.data?.error || error.message}`);
        }
    };

    const testUpload = async () => {
        try {
            // Create a small test file
            const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
            
            const formData = new FormData();
            formData.append('file', testFile);

            const response = await api.post('/upload/additional-photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Upload test response:', response.data);
            setResult('✅ Upload test successful');
        } catch (error: any) {
            console.error('Upload test error:', error);
            setResult(`❌ Upload test failed: ${error.response?.data?.error || error.message}`);
        }
    };

    return (
        <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Authentication & Upload Test</h3>
            
            <div className="space-y-2">
                <button
                    onClick={testAuth}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Test Authentication
                </button>
                
                <button
                    onClick={testUpload}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-2"
                >
                    Test Upload
                </button>
            </div>
            
            {result && (
                <div className="mt-4 p-3 bg-white rounded border">
                    <p className="text-sm">{result}</p>
                </div>
            )}
        </div>
    );
};

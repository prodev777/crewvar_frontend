import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/api`
        : "http://localhost:3000/api"
});

// Debug utility functions
export const debugAuth = {
    checkToken: () => {
        const token = localStorage.getItem('token');
        console.log('🔍 Token Debug Info:', {
            exists: !!token,
            length: token?.length || 0,
            preview: token ? `${token.substring(0, 20)}...` : 'null',
            timestamp: new Date().toISOString()
        });
        return token;
    },
    
    clearToken: () => {
        localStorage.removeItem('token');
        console.log('🗑️ Token cleared from localStorage');
    },
    
    testApiCall: async (endpoint: string) => {
        const token = localStorage.getItem('token');
        console.log('🧪 Testing API call to:', endpoint);
        console.log('Token available:', !!token);
        
        try {
            const response = await api.get(endpoint);
            console.log('✅ API call successful:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ API call failed:', {
                status: error.response?.status,
                message: error.message,
                data: error.response?.data
            });
            throw error;
        }
    }
};

// Add JWT token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    
    // Debug logging for authentication
    console.log('🔍 API Request Debug:', {
        url: config.url,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'null',
        timestamp: new Date().toISOString()
    });
    
    // Define endpoints that don't require authentication
    const publicEndpoints = [
        '/auth/login',
        '/auth/session-login',
        '/auth/register',
        '/auth/register/google',
        '/auth/register-with-google',
        '/auth/verify-email',
        '/auth/reset-password',
        '/auth/forgot-password'
    ];
    
    // Check if the current request is to a public endpoint
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
        config.url?.includes(endpoint)
    );
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Token added to request headers');
    } else if (!isPublicEndpoint) {
        // Cancel the request if no token is available and it's not a public endpoint
        console.error('❌ No authentication token available for protected endpoint:', config.url);
        return Promise.reject(new Error('No authentication token available'));
    } else {
        console.log('ℹ️ Public endpoint, no token required:', config.url);
    }
    
    return config;
});

// Handle token expiration
api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response Success:', {
            url: response.config.url,
            status: response.status,
            timestamp: new Date().toISOString()
        });
        return response;
    },
    (error) => {
        console.error('❌ API Response Error:', {
            url: error.config?.url,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            timestamp: new Date().toISOString()
        });
        
        if (error.response?.status === 401) {
            // Token expired or invalid
            console.error('🔐 Authentication failed - removing token');
            localStorage.removeItem('token');
            // Temporarily disabled redirect to prevent infinite loops
            // window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);

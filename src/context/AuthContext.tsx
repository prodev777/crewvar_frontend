import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { api } from "../app/api";

interface Props {
    children: ReactNode;
}

// Firebase-compatible User interface
interface FirebaseUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    getIdToken: () => Promise<string>;
    reload: () => Promise<void>;
}

interface IAuthContext {
  currentUser: FirebaseUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: FirebaseUser }>;
  signOut: () => void;
}

const AuthContext = createContext<IAuthContext>({
    currentUser: null,
    isLoading: true,
    signIn: async () => { throw new Error('Auth not initialized'); },
    signOut: () => {}
});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: Props) => {
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const signIn = async (email: string, password: string) => {
        try {
            // Use backend authentication
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;
            
            // Store token
            localStorage.setItem('token', token);
            
            // Create Firebase-compatible user object
            const firebaseUser: FirebaseUser = {
                uid: user.userId || user.id || 'unknown',
                email: user.email,
                displayName: user.displayName || user.fullName || user.email?.split('@')[0] || 'User',
                photoURL: user.profilePhoto || user.avatar || null,
                getIdToken: async () => token,
                reload: async () => {
                    // Refresh user data from backend
                    try {
                        const userResponse = await api.get('/auth/profile');
                        const updatedUser = userResponse.data;
                        setCurrentUser({
                            ...firebaseUser,
                            displayName: updatedUser.displayName || updatedUser.fullName || firebaseUser.displayName,
                            photoURL: updatedUser.profilePhoto || updatedUser.avatar || firebaseUser.photoURL
                        });
                    } catch (error) {
                        console.error('Failed to reload user:', error);
                    }
                }
            };
            
            setCurrentUser(firebaseUser);
            return { user: firebaseUser };
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            localStorage.removeItem('token');
            setCurrentUser(null);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    useEffect(() => {
        const checkAuthStatus = () => {
            const token = localStorage.getItem('token');
            
            if (token) {
                // Create a basic user object for existing token
                const firebaseUser: FirebaseUser = {
                    uid: 'current_user',
                    email: 'user@example.com',
                    displayName: 'User',
                    photoURL: null,
                    getIdToken: async () => token,
                    reload: async () => {
                        console.log('User reload called');
                    }
                };
                setCurrentUser(firebaseUser);
            } else {
                setCurrentUser(null);
            }
            
            setIsLoading(false);
        };

        checkAuthStatus();
    }, []);

    const value = {
        currentUser,
        isLoading,
        signIn,
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
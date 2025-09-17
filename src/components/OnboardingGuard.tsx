import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOnboardingGuard } from "../context/OnboardingGuardContext";
import { useUserProfile } from "../features/auth/api/userProfile";

interface OnboardingGuardProps {
    children: React.ReactNode;
}

export const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const { currentUser, isLoading: authLoading } = useAuth();
    const { 
        checkOnboardingStatus 
    } = useOnboardingGuard();
    
    // Get actual user profile data
    const { data: userProfile, isLoading: profileLoading } = useUserProfile();

    // Check if user profile is complete based on actual data
    const isProfileComplete = userProfile && 
        userProfile.display_name && 
        userProfile.profile_photo && 
        userProfile.department_id && 
        userProfile.subcategory_id && 
        userProfile.role_id && 
        userProfile.current_ship_id;

    // Check if email is verified - DISABLED FOR NOW
    const isEmailVerified = true; // Skip email verification for now

    // Public routes that don't require authentication
    const publicRoutes = [
        '/',
        '/auth/login',
        '/auth/signup',
        '/auth/verify-email',
        '/auth/verification-pending',
        '/onboarding'
    ];

    // Check if current route is public
    const isPublicRoute = publicRoutes.some(route => 
        location.pathname === route || location.pathname.startsWith(route + '/')
    );

    useEffect(() => {
        // Small delay to allow Firebase to restore state
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Check onboarding status when user is authenticated
    useEffect(() => {
        if (currentUser && !isPublicRoute) {
            checkOnboardingStatus("current_user").catch(error => {
                console.error('Failed to check onboarding status:', error);
            });
        }
    }, [currentUser, isPublicRoute, checkOnboardingStatus]);

    useEffect(() => {
        // Don't redirect while loading
        if (isLoading || authLoading || profileLoading) return;

        // If not authenticated and trying to access protected route, redirect to login
        if (!currentUser && !isPublicRoute) {
            console.log('No user logged in, redirecting to login');
            navigate('/auth/login', { 
                replace: true,
                state: { from: location.pathname }
            });
            return;
        }

        // If authenticated, check email verification first
        if (currentUser && !isPublicRoute) {
            // If email is not verified, redirect to verification pending page
            if (!isEmailVerified) {
                console.log('Email not verified, redirecting to verification pending');
                navigate('/auth/verification-pending', { 
                    replace: true,
                    state: { 
                        from: location.pathname,
                        email: currentUser.email
                    }
                });
                return;
            }

            // If email is verified but profile is not complete, redirect to onboarding
            // Add a small delay to prevent race conditions with profile updates
            if (!isProfileComplete) {
                console.log('Profile not complete, redirecting to onboarding');
                console.log('Profile data:', userProfile);
                
                // Only redirect if we're not already on the onboarding page
                if (location.pathname !== '/onboarding') {
                    navigate('/onboarding', { 
                        replace: true,
                        state: { 
                            from: location.pathname
                        }
                    });
                }
                return;
            }
        }
    }, [isLoading, authLoading, profileLoading, currentUser, isPublicRoute, isEmailVerified, isProfileComplete, userProfile, navigate, location.pathname]);

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#B9F3DF' }}>
                <div className="text-center">
                    <div className="w-16 h-16 bg-[#069B93] rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-[#069B93] font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // Show loading while checking profile status
    if (currentUser && !isPublicRoute && profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#B9F3DF' }}>
                <div className="text-center">
                    <div className="w-16 h-16 bg-[#069B93] rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-[#069B93] font-medium">Checking your profile...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
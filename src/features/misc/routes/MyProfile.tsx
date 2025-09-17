import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { SocialMediaLinks } from "../../../components/SocialMediaLinks";
import { SocialMediaDisplay } from "../../../components/SocialMediaDisplay";
import { ProfileEdit } from "../../../components/ProfileEdit";
import { ProfilePhotoUpload } from "../../../components/ProfilePhotoUpload";
import { AdditionalPhotoUpload } from "../../../components/AdditionalPhotoUpload";
import { sampleDepartments, sampleRoles } from "../../../data/onboarding-data";
import { useUserProfile, useUpdateProfileDetails, useUpdateUserProfile } from "../../auth/api/userProfile";
import { useAllShips, useCruiseLines } from "../../cruise/api/cruiseData";

export const MyProfile = () => {
    const { currentUser } = useAuth();
    const { data: userProfile, isLoading: profileLoading } = useUserProfile();
    const { data: allShips = [], isLoading: shipsLoading } = useAllShips();
    const { data: cruiseLines = [], isLoading: cruiseLinesLoading } = useCruiseLines();
    const { mutateAsync: updateProfileDetails } = useUpdateProfileDetails();
    const { mutateAsync: updateUserProfile } = useUpdateUserProfile();
    
    // Helper functions to get names from IDs
    const getDepartmentName = (departmentId: string) => {
        console.log('MyProfile: Looking up department for ID:', departmentId);
        console.log('MyProfile: Available departments:', sampleDepartments);
        const department = sampleDepartments.find(d => d.id === departmentId);
        const result = department ? department.name : 'Not specified';
        console.log('MyProfile: Department lookup result:', result);
        return result;
    };
    
    const getRoleName = (roleId: string) => {
        console.log('MyProfile: Looking up role for ID:', roleId);
        console.log('MyProfile: Available roles:', sampleRoles);
        const role = sampleRoles.find(r => r.id === roleId);
        const result = role ? role.name : 'Not specified';
        console.log('MyProfile: Role lookup result:', result);
        return result;
    };

    const getShipName = (shipId: string) => {
        console.log('MyProfile: Looking up ship for ID:', shipId);
        console.log('MyProfile: Available ships:', allShips);
        const ship = allShips.find(s => s.id === shipId);
        const result = ship ? ship.name : 'Not specified';
        console.log('MyProfile: Ship lookup result:', result);
        return result;
    };

    const getCruiseLineFromShip = (shipId: string) => {
        console.log('MyProfile: Looking up cruise line for ship ID:', shipId);
        console.log('MyProfile: Available ships:', allShips);
        console.log('MyProfile: Available cruise lines:', cruiseLines);
        const ship = allShips.find(s => s.id === shipId);
        if (ship) {
            // Try to get cruise line name from ship data first
            if (ship.cruise_line_name) {
                console.log('MyProfile: Found cruise line name from ship:', ship.cruise_line_name);
                return ship.cruise_line_name;
            }
            // Fallback to finding cruise line by ID
            const cruiseLine = cruiseLines.find(c => c.id === ship.cruise_line_id);
            const result = cruiseLine ? cruiseLine.name : 'Not specified';
            console.log('MyProfile: Cruise line lookup result:', result);
            return result;
        }
        console.log('MyProfile: Ship not found, returning Not specified');
        return 'Not specified';
    };
    
    const [profile, setProfile] = useState({
        displayName: '',
        avatar: '',
        bio: '',
        photos: ['', '', ''],
        contacts: {
            email: '',
            phone: '',
            social: ['']
        },
        socialMedia: {
            instagram: '',
            twitter: '',
            facebook: '',
            snapchat: '',
            website: ''
        },
        // Job information
        departmentId: '',
        subcategoryId: '',
        roleId: '',
        currentShipId: '',
        cruiseLineId: '',
        // Privacy settings
        privacy: {
            showEmail: true,
            showPhone: true,
            showSocialMedia: true,
            showPhotos: true,
            showBio: true,
            showAssignment: true
        }
    });

    // Update profile state when userProfile data is loaded
    useEffect(() => {
        if (userProfile) {
            console.log('MyProfile: Loading userProfile data:', userProfile);
            console.log('MyProfile: Current user data:', currentUser);
            
            setProfile(prev => ({
                ...prev,
                displayName: userProfile.display_name || currentUser?.displayName || '',
                avatar: userProfile.profile_photo || currentUser?.photoURL || '',
                bio: userProfile.bio || '',
                contacts: {
                    ...prev.contacts,
                    email: userProfile.email || currentUser?.email || '',
                    phone: userProfile.phone || ''
                },
                socialMedia: {
                    instagram: userProfile.instagram || '',
                    twitter: userProfile.twitter || '',
                    facebook: userProfile.facebook || '',
                    snapchat: userProfile.snapchat || '',
                    website: userProfile.website || ''
                },
                photos: [
                    userProfile.additional_photo_1 || '',
                    userProfile.additional_photo_2 || '',
                    userProfile.additional_photo_3 || ''
                ],
                departmentId: userProfile.department_id || '',
                subcategoryId: userProfile.subcategory_id || '',
                roleId: userProfile.role_id || '',
                currentShipId: userProfile.current_ship_id || ''
            }));
            
            console.log('MyProfile: Profile state updated with:', {
                displayName: userProfile.display_name || currentUser?.displayName || '',
                avatar: userProfile.profile_photo ? 'Profile photo data present' : 'No profile photo',
                bio: userProfile.bio || '',
                phone: userProfile.phone || '',
                departmentId: userProfile.department_id || '',
                subcategoryId: userProfile.subcategory_id || '',
                roleId: userProfile.role_id || '',
                currentShipId: userProfile.current_ship_id || ''
            });
        }
    }, [userProfile, currentUser]);

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditingSocialMedia, setIsEditingSocialMedia] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingPrivacy, setIsEditingPrivacy] = useState(false);

    // Simple utility to convert undefined to null
    const toNull = (value: any) => {
        console.log(`toNull input: ${value} (type: ${typeof value})`);
        const result = value === undefined ? null : value;
        console.log(`toNull output: ${result} (type: ${typeof result})`);
        return result;
    };

    const handleSave = async () => {
        setIsLoading(true);
        
        try {
            // Save profile photo if it has changed
            if (profile.avatar !== userProfile?.profile_photo) {
                console.log('Updating profile photo...');
                await updateUserProfile({
                    displayName: profile.displayName,
                    profilePhoto: profile.avatar,
                    departmentId: profile.departmentId,
                    subcategoryId: profile.subcategoryId,
                    roleId: profile.roleId,
                    currentShipId: profile.currentShipId
                });
                console.log('Profile photo updated successfully');
            }
            
            // Save profile details (bio, contacts, social media, additional photos)
            const profileDetailsData = {
                bio: toNull(profile.bio),
                phone: toNull(profile.contacts?.phone),
                instagram: toNull(profile.socialMedia?.instagram),
                twitter: toNull(profile.socialMedia?.twitter),
                facebook: toNull(profile.socialMedia?.facebook),
                snapchat: toNull(profile.socialMedia?.snapchat),
                website: toNull(profile.socialMedia?.website),
                additionalPhotos: profile.photos || [],
                additionalPhotosCount: (profile.photos || []).length
            };
            
            console.log('Profile details data:', profileDetailsData);
            console.log('Checking for undefined values:');
            Object.keys(profileDetailsData).forEach(key => {
                const value = (profileDetailsData as any)[key];
                if (value === undefined) {
                    console.error(`UNDEFINED FOUND: ${key} = ${value}`);
                }
            });
            
            await updateProfileDetails(profileDetailsData);
            
            setIsEditing(false);
            console.log('Profile updated successfully');
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            console.error('Error details:', error.response?.data);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to update profile. Please try again.';
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialMediaSave = async (socialMediaData: any) => {
        setIsLoading(true);
        
        // Clean and validate the data before sending
        const cleanedData = {
            bio: toNull(profile.bio),
            phone: toNull(profile.contacts?.phone),
            instagram: toNull(socialMediaData.instagram),
            twitter: toNull(socialMediaData.twitter),
            facebook: toNull(socialMediaData.facebook),
            snapchat: toNull(socialMediaData.snapchat),
            website: toNull(socialMediaData.website),
            additionalPhotos: profile.photos || []
        };
        
        try {
            
            console.log('Cleaned social media data:', cleanedData);
            console.log('Checking for undefined values:');
            Object.keys(cleanedData).forEach(key => {
                const value = (cleanedData as any)[key];
                if (value === undefined) {
                    console.error(`UNDEFINED FOUND: ${key} = ${value}`);
                }
            });
            
            console.log('About to send cleaned data to API:', cleanedData);
            await updateProfileDetails(cleanedData);
            
            setProfile(prev => ({ ...prev, socialMedia: cleanedData }));
            setIsEditingSocialMedia(false);
            console.log('Social media updated successfully');
            
            // Show success message
            alert('Social media links saved successfully!');
            
        } catch (error: any) {
            console.error('Failed to update social media:', error);
            console.error('Error details:', error.response?.data);
            console.error('Request data sent:', cleanedData);
            
            // Better error handling
            let errorMessage = 'Failed to update social media. Please try again.';
            
            if (error.response?.status === 500) {
                errorMessage = 'Server error occurred. The backend may be experiencing issues. Please try again later.';
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            alert(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileEditSave = async (profileData: any) => {
        setIsLoading(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setProfile(prev => ({ 
                ...prev, 
                ...profileData,
                contacts: { ...prev.contacts, phone: profileData.phoneNumber }
            }));
            setIsEditingProfile(false);
            console.log('Profile updated:', profileData);
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset to original values from userProfile
        if (userProfile) {
            setProfile(prev => ({
                ...prev,
                displayName: userProfile.display_name || currentUser?.displayName || '',
                avatar: userProfile.profile_photo || currentUser?.photoURL || '',
                bio: userProfile.bio || '',
                contacts: {
                    ...prev.contacts,
                    email: userProfile.email || currentUser?.email || '',
                    phone: userProfile.phone || ''
                },
                socialMedia: {
                    instagram: userProfile.instagram || '',
                    twitter: userProfile.twitter || '',
                    facebook: userProfile.facebook || '',
                    snapchat: userProfile.snapchat || '',
                    website: userProfile.website || ''
                },
                photos: [
                    userProfile.additional_photo_1 || '',
                    userProfile.additional_photo_2 || '',
                    userProfile.additional_photo_3 || ''
                ],
                departmentId: userProfile.department_id || '',
                subcategoryId: userProfile.subcategory_id || '',
                roleId: userProfile.role_id || '',
                currentShipId: userProfile.current_ship_id || ''
            }));
        }
    };

    // Show loading state while profile data is being fetched
    if (profileLoading || shipsLoading || cruiseLinesLoading) {
        return (
            <div className="container">
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#B9F3DF' }}>
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-[#069B93] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#B9F3DF] via-[#E8F8F5] to-[#B9F3DF]">
            <div className="container mx-auto px-4 py-6 lg:py-8">
                {/* Header */}
                <div className="mb-6 lg:mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => window.location.href = '/dashboard'}
                                className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-[#069B93] hover:bg-[#069B93] hover:text-white"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">My Profile</h1>
                                <p className="text-gray-600 text-sm lg:text-base">Manage your profile information and settings</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                                isEditing 
                                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg' 
                                    : 'bg-[#069B93] hover:bg-[#058a7a] text-white shadow-md hover:shadow-lg'
                            }`}
                        >
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto">
                    {/* Profile Header Card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-[#069B93] via-[#00A59E] to-[#069B93] p-6 lg:p-8">
                            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-6">
                                <div className="relative flex-shrink-0">
                                    <ProfilePhotoUpload
                                        currentPhoto={profile.avatar}
                                        onPhotoChange={(photoUrl) => {
                                            setProfile(prev => ({ ...prev, avatar: photoUrl }));
                                        }}
                                        size="large"
                                        className="w-24 h-24 lg:w-32 lg:h-32 rounded-full shadow-2xl"
                                        showInstructions={false}
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white"></div>
                                </div>
                                <div className="flex-1 text-center lg:text-left">
                                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{profile.displayName || 'Crew Member'}</h1>
                                    <p className="text-[#B9F3DF] text-lg lg:text-xl mb-3">Crew Member</p>
                                    <div className="flex items-center justify-center lg:justify-start space-x-3">
                                        <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span className="text-sm text-white font-medium">Online</span>
                                        </div>
                                        <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm text-white font-medium">Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Current Assignment Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                                        <svg className="w-6 h-6 text-[#069B93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <span>Current Assignment</span>
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-r from-[#069B93]/10 to-[#00A59E]/10 rounded-xl p-4 border border-[#069B93]/20">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="w-10 h-10 bg-[#069B93] rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800">Cruise Line</h3>
                                                <p className="text-sm text-gray-500">Company</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 font-medium">
                                            {shipsLoading || cruiseLinesLoading ? (
                                                <span className="text-[#069B93] animate-pulse">Loading...</span>
                                            ) : profile.currentShipId ? getCruiseLineFromShip(profile.currentShipId) : 'Not specified'}
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-r from-[#069B93]/10 to-[#00A59E]/10 rounded-xl p-4 border border-[#069B93]/20">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <div className="w-10 h-10 bg-[#069B93] rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800">Ship</h3>
                                                <p className="text-sm text-gray-500">Vessel</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 font-medium">
                                            {shipsLoading ? (
                                                <span className="text-[#069B93] animate-pulse">Loading...</span>
                                            ) : profile.currentShipId ? getShipName(profile.currentShipId) : 'Not specified'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Job Information Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                                        <svg className="w-6 h-6 text-[#069B93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                                        </svg>
                                        <span>Job Information</span>
                                    </h2>
                                    <button
                                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                                        className="px-4 py-2 text-sm font-medium text-[#069B93] hover:text-white hover:bg-[#069B93] rounded-lg transition-all duration-200 border border-[#069B93] hover:border-[#069B93]"
                                    >
                                        {isEditingProfile ? 'Cancel' : 'Edit'}
                                    </button>
                                </div>
                                
                                {isEditingProfile ? (
                                    <ProfileEdit
                                        initialData={{
                                            displayName: profile.displayName,
                                            departmentId: profile.departmentId,
                                            subcategoryId: profile.subcategoryId,
                                            roleId: profile.roleId,
                                            currentShipId: profile.currentShipId,
                                            phoneNumber: profile.contacts.phone,
                                            bio: profile.bio
                                        }}
                                        onSave={handleProfileEditSave}
                                        onCancel={() => setIsEditingProfile(false)}
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-r from-[#069B93]/10 to-[#00A59E]/10 rounded-xl p-4 border border-[#069B93]/20">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <div className="w-10 h-10 bg-[#069B93] rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm3-1a1 1 0 011-1h2a1 1 0 011 1v1H9V5z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">Department</h3>
                                                    <p className="text-sm text-gray-500">Division</p>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 font-medium">
                                                {profile.departmentId ? getDepartmentName(profile.departmentId) : 'Not specified'}
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-r from-[#069B93]/10 to-[#00A59E]/10 rounded-xl p-4 border border-[#069B93]/20">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <div className="w-10 h-10 bg-[#069B93] rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">Role</h3>
                                                    <p className="text-sm text-gray-500">Position</p>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 font-medium">
                                                {profile.roleId ? getRoleName(profile.roleId) : 'Not specified'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bio Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2 mb-6">
                                    <svg className="w-6 h-6 text-[#069B93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>About Me</span>
                                </h2>
                                {isEditing ? (
                                    <textarea
                                        value={profile.bio}
                                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                                        placeholder="Tell other crew members about yourself, your interests, and what makes you unique..."
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#069B93] focus:ring-2 focus:ring-[#069B93]/20 focus:outline-none resize-none transition-all duration-200"
                                        rows={4}
                                    />
                                ) : (
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                                        <p className="text-gray-700 leading-relaxed">
                                            {profile.bio || 'No bio added yet. Click "Edit Profile" to add information about yourself.'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Photos Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2 mb-6">
                                    <svg className="w-6 h-6 text-[#069B93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>Photos</span>
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {profile.photos.map((photo, index) => (
                                        <AdditionalPhotoUpload
                                            key={index}
                                            currentPhoto={photo}
                                            onPhotoChange={(photoUrl) => {
                                                const newPhotos = [...profile.photos];
                                                newPhotos[index] = photoUrl;
                                                setProfile(prev => ({ ...prev, photos: newPhotos }));
                                            }}
                                            onPhotoDelete={() => {
                                                const newPhotos = [...profile.photos];
                                                newPhotos[index] = '';
                                                setProfile(prev => ({ ...prev, photos: newPhotos }));
                                            }}
                                            index={index}
                                        />
                                    ))}
                                </div>
                                {isEditing && (
                                    <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                                        <p className="text-sm text-blue-700">
                                            💡 You can add up to 3 photos. Drag & drop or click to upload images (max 10MB each).
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Contact & Social */}
                        <div className="space-y-6">
                            {/* Contact Information Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2 mb-6">
                                    <svg className="w-6 h-6 text-[#069B93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>Contact</span>
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-[#069B93]/10 to-[#00A59E]/10 rounded-xl">
                                        <div className="w-10 h-10 bg-[#069B93] rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500">Email</p>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    value={profile.contacts.email}
                                                    onChange={(e) => setProfile(prev => ({ 
                                                        ...prev, 
                                                        contacts: { ...prev.contacts, email: e.target.value }
                                                    }))}
                                                    className="w-full text-gray-700 font-medium bg-transparent border-none p-0 focus:outline-none"
                                                />
                                            ) : (
                                                <p className="text-gray-700 font-medium">{profile.contacts.email}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-[#069B93]/10 to-[#00A59E]/10 rounded-xl">
                                        <div className="w-10 h-10 bg-[#069B93] rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500">Phone</p>
                                            {isEditing ? (
                                                <input
                                                    type="tel"
                                                    value={profile.contacts.phone}
                                                    onChange={(e) => setProfile(prev => ({ 
                                                        ...prev, 
                                                        contacts: { ...prev.contacts, phone: e.target.value }
                                                    }))}
                                                    placeholder="Add phone number"
                                                    className="w-full text-gray-700 font-medium bg-transparent border-none p-0 focus:outline-none placeholder-gray-400"
                                                />
                                            ) : (
                                                <p className="text-gray-700 font-medium">{profile.contacts.phone || 'No phone number'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Social Media Card */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                                        <svg className="w-6 h-6 text-[#069B93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        <span>Social Media</span>
                                    </h2>
                                    <button
                                        onClick={() => setIsEditingSocialMedia(!isEditingSocialMedia)}
                                        className="px-4 py-2 text-sm font-medium text-[#069B93] hover:text-white hover:bg-[#069B93] rounded-lg transition-all duration-200 border border-[#069B93] hover:border-[#069B93]"
                                    >
                                        {isEditingSocialMedia ? 'Cancel' : 'Edit'}
                                    </button>
                                </div>
                                
                                {isEditingSocialMedia ? (
                                    <SocialMediaLinks
                                        initialData={profile.socialMedia}
                                        onSave={handleSocialMediaSave}
                                        onCancel={() => setIsEditingSocialMedia(false)}
                                    />
                                ) : (
                                    <SocialMediaDisplay socialMedia={profile.socialMedia} />
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Privacy Settings - Full Width */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                                <svg className="w-6 h-6 text-[#069B93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Privacy Settings</span>
                            </h2>
                            <button
                                onClick={() => setIsEditingPrivacy(!isEditingPrivacy)}
                                className="px-4 py-2 text-sm font-medium text-[#069B93] hover:text-white hover:bg-[#069B93] rounded-lg transition-all duration-200 border border-[#069B93] hover:border-[#069B93]"
                            >
                                {isEditingPrivacy ? 'Cancel' : 'Edit Privacy'}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-[#069B93] rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">Email Address</h4>
                                        <p className="text-sm text-gray-600">Show email to connected users</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={profile.privacy.showEmail}
                                        onChange={(e) => setProfile(prev => ({
                                            ...prev,
                                            privacy: { ...prev.privacy, showEmail: e.target.checked }
                                        }))}
                                        disabled={!isEditingPrivacy}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#069B93]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#069B93]"></div>
                                </label>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-[#069B93] rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">Phone Number</h4>
                                        <p className="text-sm text-gray-600">Show phone to connected users</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={profile.privacy.showPhone}
                                        onChange={(e) => setProfile(prev => ({
                                            ...prev,
                                            privacy: { ...prev.privacy, showPhone: e.target.checked }
                                        }))}
                                        disabled={!isEditingPrivacy}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#069B93]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#069B93]"></div>
                                </label>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-[#069B93] rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">Social Media</h4>
                                        <p className="text-sm text-gray-600">Show social links to connected users</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={profile.privacy.showSocialMedia}
                                        onChange={(e) => setProfile(prev => ({
                                            ...prev,
                                            privacy: { ...prev.privacy, showSocialMedia: e.target.checked }
                                        }))}
                                        disabled={!isEditingPrivacy}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#069B93]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#069B93]"></div>
                                </label>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-[#069B93] rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">Additional Photos</h4>
                                        <p className="text-sm text-gray-600">Show photos to connected users</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={profile.privacy.showPhotos}
                                        onChange={(e) => setProfile(prev => ({
                                            ...prev,
                                            privacy: { ...prev.privacy, showPhotos: e.target.checked }
                                        }))}
                                        disabled={!isEditingPrivacy}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#069B93]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#069B93]"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Privacy Notice */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mt-6">
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-2">Privacy Notice</h4>
                                <p className="text-blue-700 leading-relaxed">
                                    Your contact information and additional photos are only visible to crewvar users you've connected with. 
                                    Your current ship assignment is only shown for today. Use the privacy settings above to control what information is shared.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    {isEditing && (
                        <div className="flex flex-col sm:flex-row gap-4 mt-8">
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="flex-1 px-8 py-4 text-white bg-gradient-to-r from-[#069B93] to-[#00A59E] hover:from-[#058a7a] hover:to-[#069B93] rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Saving Changes...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Save Changes</span>
                                    </div>
                                )}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-8 py-4 text-gray-600 bg-white hover:bg-gray-50 rounded-xl font-semibold transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

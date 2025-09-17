import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useUserProfile as useCrewUserProfile } from "../api/crewApi";
import { useConnectionStatus, useSendConnectionRequest } from "../../connections/api/connectionApi";
import { defaultAvatar } from "../../../utils/images";
import logo from "../../../assets/images/Home/logo.png";

export const CrewMemberProfile = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { data: crewProfile, isLoading: profileLoading, error } = useCrewUserProfile(userId || '');
    const { data: connectionStatus } = useConnectionStatus(userId || '');
    const sendConnectionRequest = useSendConnectionRequest();
    const [connectionMessage, setConnectionMessage] = useState('');
    const [showMessageInput, setShowMessageInput] = useState(false);

    // Debug logging
    console.log('CrewMemberProfile - userId:', userId);
    console.log('CrewMemberProfile - profileLoading:', profileLoading);
    console.log('CrewMemberProfile - error:', error);
    console.log('CrewMemberProfile - crewProfile:', crewProfile);
    console.log('CrewMemberProfile - connectionStatus:', connectionStatus);

    // Show loading state
    if (profileLoading) {
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

    // Show error state
    if (error || !crewProfile?.profile) {
        const errorMessage = (error as any)?.message || 'Unknown error';
        const errorStatus = (error as any)?.response?.status;
        
        return (
            <div className="container">
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#B9F3DF' }}>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
                        <p className="text-gray-600 mb-2">This crew member profile could not be found.</p>
                        {!!error && (
                            <div className="text-sm text-gray-500 mb-4">
                                <p>Error: {errorMessage}</p>
                                {errorStatus && <p>Status: {errorStatus}</p>}
                                <p>User ID: {userId}</p>
                            </div>
                        )}
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const profile = crewProfile.profile;
    
    // Use real connection status from API instead of profile data
    const connectionStatusValue = connectionStatus?.status || 'none';
    const isConnected = connectionStatusValue === 'connected';
    const isPending = connectionStatusValue === 'pending';
    const isDeclined = connectionStatusValue === 'declined';

    // Handle sending connection request
    const handleSendConnectionRequest = async () => {
        if (!userId) return;
        
        try {
            await sendConnectionRequest.mutateAsync({
                receiverId: userId,
                message: connectionMessage || undefined
            });
            setShowMessageInput(false);
            setConnectionMessage('');
            alert('Connection request sent successfully!');
        } catch (error: any) {
            console.error('Failed to send connection request:', error);
            alert(error.response?.data?.error || 'Failed to send connection request. Please try again.');
        }
    };

    return (
        <div className="container">
            <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
                <div className="container mx-auto px-4 py-8">
                    {/* Header with Logo and Dashboard Button */}
                    <div className="mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            {/* Brand Section */}
                            <div className="flex items-center space-x-4">
                                <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                                    <img 
                                        src={logo} 
                                        alt="Crewvar Logo" 
                                        className="h-8 sm:h-10 w-auto"
                                    />
                                </Link>
                                <Link 
                                    to="/dashboard" 
                                    className="flex items-center space-x-2 px-3 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors text-sm font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    <span>Back to Dashboard</span>
                                </Link>
                            </div>
                            
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            {/* Profile Header */}
                            <div className="bg-gradient-to-r from-[#069B93] to-[#00A59E] p-6 text-white">
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <img 
                                            src={profile.profile_photo || defaultAvatar} 
                                            alt="Profile" 
                                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="text-2xl font-bold">{profile.display_name}</h1>
                                        <p className="text-[#B9F3DF] text-lg">{profile.role_name || 'Crew Member'}</p>
                                        <div className="flex items-center space-x-2 mt-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span className="text-sm text-[#B9F3DF]">Online now</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Content */}
                            <div className="p-6 space-y-6">
                                {/* Connection Actions */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Connection Actions</h2>
                                    <div className="flex flex-col space-y-4">
                                        {!isConnected && !isPending && !isDeclined && (
                                            <div className="space-y-3">
                                                {!showMessageInput ? (
                                                    <button 
                                                        onClick={() => setShowMessageInput(true)}
                                                        className="px-6 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium"
                                                    >
                                                        Send Connection Request
                                                    </button>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <textarea
                                                            value={connectionMessage}
                                                            onChange={(e) => setConnectionMessage(e.target.value)}
                                                            placeholder="Add a personal message (optional)..."
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#069B93] focus:border-transparent resize-none"
                                                            rows={3}
                                                            maxLength={500}
                                                        />
                                                        <div className="flex space-x-3">
                                                            <button 
                                                                onClick={handleSendConnectionRequest}
                                                                disabled={sendConnectionRequest.isLoading}
                                                                className="px-6 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {sendConnectionRequest.isLoading ? 'Sending...' : 'Send Request'}
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setShowMessageInput(false);
                                                                    setConnectionMessage('');
                                                                }}
                                                                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {isPending && (
                                            <div className="px-6 py-3 bg-yellow-100 text-yellow-800 rounded-lg font-medium text-center">
                                                Connection request pending
                                            </div>
                                        )}
                                        {isDeclined && (
                                            <div className="px-6 py-3 bg-red-100 text-red-800 rounded-lg font-medium text-center">
                                                Connection request was declined
                                            </div>
                                        )}
                                        {isConnected && (
                                            <button 
                                                onClick={() => navigate(`/chat/${userId}`)}
                                                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                            >
                                                Send Message
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Basic Information */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="font-medium text-gray-900 mb-1">Role</h3>
                                            <p className="text-gray-600">{profile.role_name || 'Not specified'}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="font-medium text-gray-900 mb-1">Department</h3>
                                            <p className="text-gray-600">{profile.department_name || 'Not specified'}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="font-medium text-gray-900 mb-1">Ship</h3>
                                            <p className="text-gray-600">{profile.ship_name || 'Not specified'}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="font-medium text-gray-900 mb-1">Cruise Line</h3>
                                            <p className="text-gray-600">{profile.cruise_line_name || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Level 2 Content - Only visible when connected */}
                                {!isConnected && !isPending ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect to See More</h3>
                                        <p className="text-gray-600 mb-6">Send a connection request to see bio, photos, contacts, and today's assignment.</p>
                                        <button 
                                            onClick={() => setShowMessageInput(true)}
                                            className="px-6 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium"
                                        >
                                            Send Connection Request
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Bio Section */}
                                        {profile.bio && (
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Additional Photos Section */}
                                        {profile.additional_photos && profile.additional_photos.length > 0 && (
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-900 mb-3">Photos</h2>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {profile.additional_photos.map((photo, index) => (
                                                        <div key={index} className="relative group">
                                                            <img 
                                                                src={photo} 
                                                                alt={`Photo ${index + 1}`}
                                                                className="w-full h-48 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Contact Information */}
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {profile.phone && (
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <h3 className="font-medium text-gray-900">Phone</h3>
                                                                <p className="text-gray-600">{profile.phone}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Social Media Links */}
                                        {(profile.instagram || profile.twitter || profile.facebook || profile.snapchat || profile.website) && (
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-900 mb-3">Social Media & Links</h2>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {profile.instagram && (
                                                        <div className="bg-gray-50 rounded-lg p-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                                                                    <span className="text-pink-600 font-bold text-sm">IG</span>
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-medium text-gray-900">Instagram</h3>
                                                                    <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                                                                        {profile.instagram}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {profile.twitter && (
                                                        <div className="bg-gray-50 rounded-lg p-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                                    <span className="text-blue-600 font-bold text-sm">TW</span>
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-medium text-gray-900">Twitter</h3>
                                                                    <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                                                                        {profile.twitter}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {profile.facebook && (
                                                        <div className="bg-gray-50 rounded-lg p-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                                    <span className="text-blue-600 font-bold text-sm">FB</span>
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-medium text-gray-900">Facebook</h3>
                                                                    <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                                                                        {profile.facebook}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {profile.snapchat && (
                                                        <div className="bg-gray-50 rounded-lg p-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                                                    <span className="text-yellow-600 font-bold text-sm">SC</span>
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-medium text-gray-900">Snapchat</h3>
                                                                    <p className="text-gray-600">{profile.snapchat}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {profile.website && (
                                                        <div className="bg-gray-50 rounded-lg p-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                                                                    </svg>
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-medium text-gray-900">Website</h3>
                                                                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm">
                                                                        {profile.website}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Today's Assignment */}
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Today's Assignment</h2>
                                            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-blue-800 font-medium">Morning: Guest Entertainment Setup</p>
                                                        <p className="text-blue-600 text-sm">Deck 5 - Main Theater • 9:00 AM - 12:00 PM</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
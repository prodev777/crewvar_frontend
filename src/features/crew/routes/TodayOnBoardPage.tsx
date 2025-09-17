import { useCrewOnboard, ICrewMember } from '../api/crewApi';
import { defaultAvatar } from '../../../utils/images';
import { Link } from 'react-router-dom';
import logo from '../../../assets/images/Home/logo.png';
import { useSendConnectionRequest } from '../../connections/api/connectionApi';
import { useFavorites } from '../../../context/FavoritesContext';
import { toast } from 'react-toastify';
import { useState } from 'react';

export const TodayOnBoardPage = () => {
    const { data: crewData, isLoading: crewLoading, error: crewError } = useCrewOnboard();
    const sendConnectionRequestMutation = useSendConnectionRequest();
    const { addFavorite, isFavorite } = useFavorites();
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [favoriteLoadingStates, setFavoriteLoadingStates] = useState<Record<string, boolean>>({});
    const [searchQuery, setSearchQuery] = useState('');

    const handleConnect = async (memberId: string, memberName: string) => {
        try {
            // Set loading state for this specific member
            setLoadingStates(prev => ({ ...prev, [memberId]: true }));
            
            // Send connection request using the real API
            await sendConnectionRequestMutation.mutateAsync({
                receiverId: memberId,
                message: `Hi ${memberName}! I'd like to connect with you.`
            });
            
            // Show success message
            toast.success(`Connection request sent to ${memberName}!`);
            
        } catch (error: any) {
            console.error('Failed to send connection request:', error);
            
            // Handle specific error cases
            const errorMessage = error.response?.data?.error;
            const errorArray = error.response?.data?.errors;
            const status = error.response?.status;
            
            if (status === 500) {
                toast.error('Server error. Please try again later.');
                console.log('Server error - backend issue');
            } else if (errorMessage === 'Connection already exists' || errorMessage === 'Connection request already sent') {
                toast.info('Connection request already sent to this user!');
            } else if (errorArray && errorArray.length > 0) {
                const firstError = errorArray[0];
                if (firstError.msg && firstError.msg.includes('already sent')) {
                    toast.info('Connection request already sent to this user!');
                } else {
                    toast.error(`Error: ${firstError.msg || 'Failed to send connection request'}`);
                }
            } else {
                toast.error('Failed to send connection request. Please try again.');
            }
        } finally {
            // Clear loading state
            setLoadingStates(prev => ({ ...prev, [memberId]: false }));
        }
    };

    const handleViewProfile = (memberId: string) => {
        // Navigate to member's profile page
        window.location.href = `/crew/${memberId}`;
    };

    const handleAddToFavorites = async (memberId: string, memberName: string) => {
        try {
            setFavoriteLoadingStates(prev => ({ ...prev, [memberId]: true }));
            
            await addFavorite(memberId);
            toast.success(`Added ${memberName} to favorites!`);
            
        } catch (error: any) {
            console.error('Failed to add to favorites:', error);
            if (error.response?.data?.error === 'User is already in favorites') {
                toast.info(`${memberName} is already in your favorites!`);
            } else {
                toast.error('Failed to add to favorites. Please try again.');
            }
        } finally {
            setFavoriteLoadingStates(prev => ({ ...prev, [memberId]: false }));
        }
    };

    if (crewLoading) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#069B93] rounded-full flex items-center justify-center mx-auto mb-4">
                                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <p className="text-[#069B93] font-medium">Loading crew members...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (crewError) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to load crew data</h3>
                        <p className="text-gray-600 mb-6">This feature requires backend connection</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="px-6 py-3 bg-[#069B93] text-white rounded-xl hover:bg-[#058a7a] transition-colors font-semibold"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const crew = crewData?.crew || [];
    const shipInfo = crewData?.shipInfo;

    // Filter crew members based on search query
    const filteredCrew = crew.filter((member: ICrewMember) => {
        if (!searchQuery.trim()) return true;
        
        const query = searchQuery.toLowerCase();
        return (
            member.display_name?.toLowerCase().includes(query) ||
            member.role_name?.toLowerCase().includes(query) ||
            member.department_name?.toLowerCase().includes(query) ||
            member.ship_name?.toLowerCase().includes(query) ||
            member.cruise_line_name?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Mobile-First Header */}
                <div className="mb-6 sm:mb-8">
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
                        
                        {/* Ship Info Section */}
                        <div className="text-left sm:text-right">
                            <div className="flex items-center space-x-2 mb-1">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Today on Board</h2>
                            </div>
                            <p className="text-sm text-gray-600">
                                {shipInfo ? `${shipInfo.ship_name} (${shipInfo.cruise_line_name})` : 'Your ship crew members'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Crew Members Section */}
                {crew.length > 0 ? (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Section Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#069B93] rounded-lg flex items-center justify-center">
                                    <span className="text-white text-xs sm:text-sm">👯‍♂️</span>
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Crew Members</h3>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="bg-[#069B93] text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium">
                                    {crew.length}
                                </span>
                                <span className="text-xs sm:text-sm text-gray-500">members</span>
                            </div>
                        </div>
                        
                        {/* Search Component */}
                        <div className="mb-6">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by name, role, department, ship, or cruise line..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#069B93] focus:border-[#069B93] text-sm"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            {searchQuery && (
                                <p className="mt-2 text-sm text-gray-600">
                                    Showing {filteredCrew.length} of {crew.length} crew members
                                </p>
                            )}
                        </div>
                        
                        {/* Mobile: Stacked Cards, Desktop: Grid */}
                        {filteredCrew.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                                {filteredCrew.map((member: ICrewMember) => (
                                <div key={member.id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-3 sm:p-4">
                                        <div className="flex items-center space-x-3 sm:space-x-4">
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={member.profile_photo || defaultAvatar}
                                                    alt={member.display_name}
                                                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                                    {member.display_name}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                                                    {member.role_name && member.role_name !== 'Not specified' && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {member.role_name}
                                                        </span>
                                                    )}
                                                    {member.department_name && member.department_name !== 'Not specified' && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                            {member.department_name}
                                                        </span>
                                                    )}
                                                    {member.ship_name && member.ship_name !== 'Not specified' && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            {member.ship_name}
                                                        </span>
                                                    )}
                                                    {member.cruise_line_name && member.cruise_line_name !== 'Not specified' && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                            {member.cruise_line_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                            {/* Action Buttons */}
                                            <div className="flex items-center space-x-2 mt-3 sm:mt-4">
                                                <button 
                                                    onClick={() => handleConnect(member.id, member.display_name)}
                                                    disabled={loadingStates[member.id] || sendConnectionRequestMutation.isLoading}
                                                    className={`flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-colors font-medium shadow-sm hover:shadow-md ${
                                                        loadingStates[member.id] || sendConnectionRequestMutation.isLoading
                                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                                            : 'bg-[#069B93] text-white hover:bg-[#058a7a]'
                                                    }`}
                                                >
                                                    {loadingStates[member.id] || sendConnectionRequestMutation.isLoading ? 'Sending...' : 'Connect'}
                                                </button>
                                                <button 
                                                    onClick={() => handleViewProfile(member.id)}
                                                    className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 text-xs sm:text-sm rounded-lg hover:border-[#069B93] hover:text-[#069B93] hover:bg-[#069B93]/5 transition-colors font-medium"
                                                >
                                                    View Profile
                                                </button>
                                                <button 
                                                    onClick={() => handleAddToFavorites(member.id, member.display_name)}
                                                    disabled={favoriteLoadingStates[member.id] || isFavorite(member.id)}
                                                    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-colors font-medium ${
                                                        isFavorite(member.id)
                                                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-300 cursor-not-allowed'
                                                            : favoriteLoadingStates[member.id]
                                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                                            : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                    }`}
                                                >
                                                    {isFavorite(member.id) ? '⭐' : favoriteLoadingStates[member.id] ? '...' : '⭐'}
                                                </button>
                                            </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">No crew members found</h3>
                                <p className="text-gray-500 mb-4">No crew members match your search criteria</p>
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors text-sm font-medium"
                                >
                                    Clear Search
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-3">No other crew members found</h3>
                        <p className="text-gray-500 mb-8">You're the only crew member on this ship</p>
                        <div className="flex items-center justify-center space-x-4">
                            <Link
                                to="/dashboard"
                                className="px-6 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium"
                            >
                                Back to Dashboard
                            </Link>
                            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-[#069B93] hover:text-[#069B93] transition-colors font-medium">
                                Invite Crew
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

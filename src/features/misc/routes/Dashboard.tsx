import { NotificationBell } from "../../../components/NotificationBell";
import { OnboardingProgress } from "../../../components/OnboardingProgress";
import { useUserProfile } from "../../auth/api/userProfile";
import { useQuickCheckIn } from "../../../context/QuickCheckInContext";
import { Link } from "react-router-dom";
import logo from "../../../assets/images/Home/logo.png";
import { defaultAvatar } from "../../../utils/images";
import { useCrewInPort, useLinkShips } from "../../port/api/portLinking";
import { useCrewOnboard } from "../../crew/api/crewApi";
import { useCruiseLines, useShipsByCruiseLine } from "../../cruise/api/cruiseData";
import { ConnectionButton } from "../../connections/components/ConnectionButton";
import { ConnectionPendingCard } from "../../connections/components/ConnectionPendingCard";
import { ConnectionRequestModal } from "../../connections/components/ConnectionRequestModal";
import { useState } from "react";


const CrewMemberCard = ({ member, showRequestDate = false }: {
    member: any;
    showRequestDate?: boolean;
}) => {
    return (
        <div className="flex items-center space-x-3 p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-[#069B93]/5 hover:to-[#069B93]/10 transition-all duration-200 group">
            <div className="relative">
                <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-[#069B93] transition-colors"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 truncate group-hover:text-[#069B93] transition-colors">{member.name}</h4>
                <p className="text-xs text-gray-600 truncate">{member.role}</p>
                <div className="flex flex-wrap items-center gap-1 mt-1">
                    {member.role && member.role !== 'Not specified' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {member.role}
                        </span>
                    )}
                    {member.shipName && member.shipName !== 'Not specified' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {member.shipName}
                        </span>
                    )}
                    {member.cruiseLineName && member.cruiseLineName !== 'Not specified' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {member.cruiseLineName}
                        </span>
                    )}
                </div>
                {showRequestDate && (
                    <p className="text-xs text-[#069B93] font-medium mt-1">{member.requestDate}</p>
                )}
            </div>
            <div className="flex flex-col space-y-1">
                <ConnectionButton 
                    userId={member.id} 
                    userName={member.name}
                    size="sm"
                />
                <button 
                    onClick={() => window.location.href = `/crew/${member.id}`}
                    className="px-2 py-1 text-xs border border-gray-300 text-gray-600 rounded hover:border-[#069B93] hover:text-[#069B93] transition-colors"
                >
                    View
                </button>
            </div>
        </div>
    );
};

// Today on Board Card Component
const TodayOnBoardCard = ({ onConnectClick }: { onConnectClick: () => void }) => {
    const { data: crewData, isLoading: crewLoading, error: crewError } = useCrewOnboard();
    
    const crew = crewData?.crew || [];

    const handleViewAll = () => {
        // Navigate to the dedicated page
        window.location.href = '/today-onboard';
    };

    if (crewLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#069B93]">🚢 Today on Board</h3>
                    <span className="bg-gradient-to-r from-[#069B93] to-[#058a7a] text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                        ...
                    </span>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#069B93] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (crewError) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#069B93]">🚢 Today on Board</h3>
                    <span className="bg-gradient-to-r from-[#069B93] to-[#058a7a] text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                        0
                </span>
                </div>
                <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">Unable to load crew data</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors text-sm"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#069B93]">🚢 Today on Board</h3>
                <div className="flex items-center space-x-3">
                    <span className="bg-gradient-to-r from-[#069B93] to-[#058a7a] text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                        {crew.length}
                    </span>
                    <button
                        onClick={onConnectClick}
                        className="px-3 py-2 bg-gradient-to-r from-[#069B93] to-[#058a7a] text-white text-xs rounded-lg hover:from-[#058a7a] hover:to-[#047a6a] transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Connect</span>
                    </button>
                </div>
            </div>
            
            <div className="space-y-2 mb-6">
                {crew.length > 0 ? (
                    crew.slice(0, 8).map((member) => (
                        <CrewMemberCard key={member.id} member={{
                            id: member.id,
                            name: member.display_name,
                            role: member.role_name || 'Not specified',
                            department: member.department_name || 'Not specified',
                            avatar: member.profile_photo || defaultAvatar,
                            shipName: member.ship_name,
                            cruiseLineName: member.cruise_line_name
                        }} />
                    ))
                ) : (
                    <div className="text-center py-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">No other crew members</p>
                        <p className="text-gray-500 text-xs">You're the only crew member on this ship</p>
                    </div>
                )}
            </div>
            
            <button
                onClick={handleViewAll}
                className="w-full text-center text-[#069B93] hover:text-white font-semibold text-sm py-3 border-2 border-[#069B93] rounded-xl hover:bg-gradient-to-r hover:from-[#069B93] hover:to-[#058a7a] transition-all duration-200 transform hover:scale-105"
            >
                View All
            </button>
        </div>
    );
};

// Who's in Your Port Card Component
const WhosInPortCard = () => {
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [selectedCruiseLineId, setSelectedCruiseLineId] = useState("");
    const [selectedShipId, setSelectedShipId] = useState("");
    
    const today = new Date().toISOString().split('T')[0];
    const { data: crewData, isLoading: crewLoading, error: crewError } = useCrewInPort(today);
    const { data: cruiseLines = [], isLoading: cruiseLinesLoading } = useCruiseLines();
    const { data: shipsByCruiseLine = [], isLoading: shipsByCruiseLineLoading } = useShipsByCruiseLine(selectedCruiseLineId);
    const { mutateAsync: linkShips } = useLinkShips();
    
    const crew = crewData?.crew || [];

    const handleViewAll = () => {
        // Navigate to the dedicated page
        window.location.href = '/whos-in-port';
    };

    const handleLinkShips = async () => {
        if (!selectedCruiseLineId || !selectedShipId) return;
        
        try {
            await linkShips({
                shipId: selectedShipId,
                date: today
            });
            
            setShowLinkModal(false);
            setSelectedCruiseLineId("");
            setSelectedShipId("");
        } catch (error) {
            console.error('Failed to link ships:', error);
            alert('Failed to link ships. Please try again.');
        }
    };

    if (crewLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#069B93]">🚢 Who's in Your Port</h3>
                    <span className="bg-gradient-to-r from-[#069B93] to-[#058a7a] text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                        ...
                    </span>
                </div>
                <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-[#069B93] border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (crewError) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#069B93]">🚢 Who's in Your Port</h3>
                    <span className="bg-gradient-to-r from-[#069B93] to-[#058a7a] text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                        0
                    </span>
                </div>
                <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">Unable to load port data</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors text-sm"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#069B93]">🚢 Who's in Your Port</h3>
                    <div className="flex items-center space-x-3">
                        <span className="bg-gradient-to-r from-[#069B93] to-[#058a7a] text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                            {crew.length}
                        </span>
                        <button
                            onClick={() => setShowLinkModal(true)}
                            className="px-3 py-2 bg-gradient-to-r from-[#069B93] to-[#058a7a] text-white text-xs rounded-lg hover:from-[#058a7a] hover:to-[#047a6a] transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Link Ships</span>
                        </button>
                    </div>
                </div>
                
                <div className="space-y-4 mb-6">
                    {crew.length > 0 ? (
                        crew.slice(0, 3).map((member) => (
                            <CrewMemberCard key={member.id} member={{
                                id: member.id,
                                name: member.display_name,
                                role: member.ship_name,
                                department: member.cruise_line_name,
                                avatar: member.profile_photo || defaultAvatar,
                                shipName: member.ship_name
                            }} />
                        ))
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#069B93]/10 to-[#058a7a]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-[#069B93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">No ships linked yet</h4>
                            <p className="text-gray-600 text-sm mb-4">Connect with other ships in your port to discover crew members</p>
                            <button
                                onClick={() => setShowLinkModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-[#069B93] to-[#058a7a] text-white text-sm rounded-xl hover:from-[#058a7a] hover:to-[#047a6a] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2 mx-auto"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                <span>Link Ships in Port</span>
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="flex space-x-3">
                    <button
                        onClick={handleViewAll}
                        className="w-full text-center text-[#069B93] hover:text-white font-semibold text-sm py-3 border-2 border-[#069B93] rounded-xl hover:bg-gradient-to-r hover:from-[#069B93] hover:to-[#058a7a] transition-all duration-200 transform hover:scale-105"
                    >
                        View All
                    </button>
                </div>
            </div>
            
            {/* Link Ships Modal */}
            <LinkShipsModal 
                showModal={showLinkModal}
                setShowModal={setShowLinkModal}
                selectedCruiseLineId={selectedCruiseLineId}
                setSelectedCruiseLineId={setSelectedCruiseLineId}
                selectedShipId={selectedShipId}
                setSelectedShipId={setSelectedShipId}
                cruiseLines={cruiseLines}
                cruiseLinesLoading={cruiseLinesLoading}
                shipsByCruiseLine={shipsByCruiseLine}
                shipsByCruiseLineLoading={shipsByCruiseLineLoading}
                handleLinkShips={handleLinkShips}
            />
        </>
    );
};

// Link Ships Modal Component
const LinkShipsModal = ({ 
    showModal, 
    setShowModal, 
    selectedCruiseLineId, 
    setSelectedCruiseLineId, 
    selectedShipId, 
    setSelectedShipId, 
    cruiseLines, 
    cruiseLinesLoading, 
    shipsByCruiseLine, 
    shipsByCruiseLineLoading, 
    handleLinkShips 
}: any) => {
    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-md mx-4 shadow-2xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Link Ships in Port</h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Cruise Line
                        </label>
                        {cruiseLinesLoading ? (
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                <span className="text-gray-500">Loading cruise lines...</span>
                            </div>
                        ) : (
                            <select
                                value={selectedCruiseLineId}
                                onChange={(e) => {
                                    setSelectedCruiseLineId(e.target.value);
                                    setSelectedShipId(""); // Reset ship selection when cruise line changes
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                            >
                                <option value="">Choose a cruise line...</option>
                                {cruiseLines.map((cruiseLine: any) => (
                                    <option key={cruiseLine.id} value={cruiseLine.id}>
                                        {cruiseLine.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Ship to Link With
                        </label>
                        {!selectedCruiseLineId ? (
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                <span className="text-gray-500">Please select a cruise line first</span>
                            </div>
                        ) : shipsByCruiseLineLoading ? (
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                <span className="text-gray-500">Loading ships...</span>
                            </div>
                        ) : (
                            <select
                                value={selectedShipId}
                                onChange={(e) => setSelectedShipId(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                            >
                                <option value="">Choose a ship...</option>
                                {shipsByCruiseLine.map((ship: any) => (
                                    <option key={ship.id} value={ship.id}>
                                        {ship.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
                
                <div className="flex space-x-4 mt-8">
                    <button
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleLinkShips}
                        disabled={!selectedCruiseLineId || !selectedShipId}
                        className="flex-1 px-4 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        Link Ships
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Dashboard = () => {
    const { data: userProfile, isLoading: profileLoading } = useUserProfile();
    const { setShowCheckInDialog } = useQuickCheckIn();
    const [showConnectionModal, setShowConnectionModal] = useState(false);

    // Debug logging
    console.log('Dashboard - Profile loading:', profileLoading);
    console.log('Dashboard - User profile:', userProfile);

    // const handleViewAll = (cardType: string) => {
    //     // In a real app, this would navigate to a full list page
    //     console.log(`Viewing all ${cardType}`);
    // };

    if (profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#B9F3DF' }}>
                <div className="text-center">
                    <div className="w-16 h-16 bg-[#069B93] rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-[#069B93] font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <img 
                            src={logo} 
                            alt="Crewvar Logo" 
                            className="h-12 w-auto"
                        />
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-[#069B93]">
                                    Welcome back, {userProfile?.display_name || 'Crew Member'}!
                            </h1>
                            <p className="text-gray-600">
                                Here's what's happening on your ship today.
                            </p>
                            
                            {/* Current Ship Assignment */}
                            <div className="mt-3 flex items-center space-x-3">
                                <div className="flex items-center space-x-2 px-3 py-1 bg-[#069B93]/10 rounded-lg">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-[#069B93]">
                                            {userProfile?.current_ship_id ? `Ship ID: ${userProfile.current_ship_id}` : 'No ship assigned'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                        
                        {/* Notification Bell */}
                        <div className="flex items-center space-x-4">
                            <NotificationBell />
                        </div>
                    </div>
                </div>

                {/* Onboarding Progress */}
                <OnboardingProgress />

                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Today on Board */}
                    <TodayOnBoardCard onConnectClick={() => setShowConnectionModal(true)} />

                    {/* Who's in Your Port */}
                    <WhosInPortCard />

                    {/* New Connections Pending */}
                    <ConnectionPendingCard />
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <h3 className="text-2xl font-bold text-[#069B93] mb-6">⚡ Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <button 
                            onClick={() => setShowCheckInDialog(true)}
                            className="p-6 text-left border-2 border-gray-200 rounded-xl hover:border-[#069B93] hover:bg-gradient-to-br hover:from-[#069B93]/5 hover:to-[#069B93]/10 transition-all duration-200 group transform hover:-translate-y-1 hover:shadow-lg"
                        >
                            <div className="w-12 h-12 bg-[#069B93]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#069B93] transition-colors">
                                <svg className="w-6 h-6 text-[#069B93] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-[#069B93] transition-colors">Update Ship Location</h4>
                            <p className="text-sm text-gray-600 mt-1">Confirm your current ship</p>
                        </button>
                        <Link to="/explore-ships" className="p-6 text-left border-2 border-gray-200 rounded-xl hover:border-[#069B93] hover:bg-gradient-to-br hover:from-[#069B93]/5 hover:to-[#069B93]/10 transition-all duration-200 group transform hover:-translate-y-1 hover:shadow-lg block">
                            <div className="w-12 h-12 bg-[#069B93]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#069B93] transition-colors">
                                <svg className="w-6 h-6 text-[#069B93] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-[#069B93] transition-colors">Discover who's with you today!</h4>
                            <p className="text-sm text-gray-600 mt-1">Find crew on other cruise lines and ships</p>
                        </Link>
                        <Link to="/my-profile" className="p-6 text-left border-2 border-gray-200 rounded-xl hover:border-[#069B93] hover:bg-gradient-to-br hover:from-[#069B93]/5 hover:to-[#069B93]/10 transition-all duration-200 group transform hover:-translate-y-1 hover:shadow-lg block">
                            <div className="w-12 h-12 bg-[#069B93]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#069B93] transition-colors">
                                <svg className="w-6 h-6 text-[#069B93] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-[#069B93] transition-colors">My Profile</h4>
                            <p className="text-sm text-gray-600 mt-1">Edit your profile and privacy settings</p>
                        </Link>
                        <Link to="/chat" className="p-6 text-left border-2 border-gray-200 rounded-xl hover:border-[#069B93] hover:bg-gradient-to-br hover:from-[#069B93]/5 hover:to-[#069B93]/10 transition-all duration-200 group transform hover:-translate-y-1 hover:shadow-lg block">
                            <div className="w-12 h-12 bg-[#069B93]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#069B93] transition-colors">
                                <svg className="w-6 h-6 text-[#069B93] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-[#069B93] transition-colors">Messages</h4>
                            <p className="text-sm text-gray-600 mt-1">Chat with connected crewvar users</p>
                        </Link>
                        <Link to="/favorites" className="p-6 text-left border-2 border-gray-200 rounded-xl hover:border-[#069B93] hover:bg-gradient-to-br hover:from-[#069B93]/5 hover:to-[#069B93]/10 transition-all duration-200 group transform hover:-translate-y-1 hover:shadow-lg block">
                            <div className="w-12 h-12 bg-[#069B93]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#069B93] transition-colors">
                                <svg className="w-6 h-6 text-[#069B93] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-[#069B93] transition-colors">Favorites & Alerts</h4>
                            <p className="text-sm text-gray-600 mt-1">Manage favorites and get sailing alerts</p>
                        </Link>
                    </div>
                </div>

            </div>
            
            {/* Connection Request Modal */}
            <ConnectionRequestModal 
                isOpen={showConnectionModal} 
                onClose={() => setShowConnectionModal(false)} 
            />
        </div>
    );
};

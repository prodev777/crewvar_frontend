import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { HiUsers, HiLocationMarker, HiChat, HiBell, HiMenu, HiX } from 'react-icons/hi';
import { useCrewInPort, useLinkShips } from '../../port/api/portLinking';
import { useCrewOnboard } from '../../crew/api/crewApi';
import { useCruiseLines, useShipsByCruiseLine } from '../../cruise/api/cruiseData';
import { ConnectionPendingCard } from '../../connections/components/ConnectionPendingCard';
import { defaultAvatar } from '../../../utils/images';
import Footer from '../../../components/Footer';

const CrewMemberCard = ({ member }: {
    member: any;
}) => {
    return (
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                    <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-xs truncate">{member.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{member.role}</p>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                        {member.role && member.role !== 'Not specified' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {member.role}
                            </span>
                        )}
                        {member.shipName && member.shipName !== 'Not specified' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {member.shipName}
                            </span>
                        )}
                        {member.cruiseLineName && member.cruiseLineName !== 'Not specified' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {member.cruiseLineName}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
                <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded text-xs">✓</span>
                <button 
                    onClick={() => window.location.href = `/crew/${member.id}`}
                    className="px-2 py-1 text-xs bg-[#069B93] text-white rounded hover:bg-[#058a7a] transition-colors"
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
                <div className="text-center py-8">
                    <p className="text-red-600 mb-4">Failed to load crew data</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 lg:p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex justify-between items-center mb-3 lg:mb-4">
                <h3 className="text-base lg:text-lg font-semibold text-[#069B93]">Today on Board</h3>
                <div className="flex items-center space-x-2">
                    <span className="bg-[#069B93] text-white text-xs px-2 py-1 rounded-full font-medium">
                        {crew.length}
                    </span>
                    <button
                        onClick={onConnectClick}
                        className="px-2 py-1 bg-[#069B93] text-white text-xs rounded hover:bg-[#058a7a] transition-colors"
                    >
                        Connect
                    </button>
                </div>
            </div>
            
            <div className="space-y-1 lg:space-y-2 mb-3 lg:mb-4">
                {crew.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 lg:gap-2">
                        {crew.slice(0, 8).map((member) => (
                            <CrewMemberCard key={member.id} member={{
                                id: member.id,
                                name: member.display_name,
                                role: member.role_name || 'Not specified',
                                department: member.department_name || 'Not specified',
                                avatar: member.profile_photo || defaultAvatar,
                                shipName: member.ship_name,
                                cruiseLineName: member.cruise_line_name
                            }} />
                        ))}
                    </div>
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
            
            {/* View All Button */}
            {crew.length > 0 && (
                <div className="flex justify-center">
                    <button
                        onClick={handleViewAll}
                        className="px-4 py-2 text-sm text-[#069B93] hover:text-[#058a7a] hover:bg-[#069B93]/5 rounded-lg transition-colors font-medium"
                    >
                        View All ({crew.length})
                    </button>
                </div>
            )}
            
        </div>
    );
};

// Who's in Your Port Card Component
const WhosInPortCard = () => {
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [selectedCruiseLineId, setSelectedCruiseLineId] = useState("");
    const [selectedShipId, setSelectedShipId] = useState("");
    
    const today = new Date().toISOString().split('T')[0];
    const { data: crewData, isLoading: crewLoading } = useCrewInPort(today);
    const { data: cruiseLines = [], isLoading: cruiseLinesLoading } = useCruiseLines();
    const { data: shipsByCruiseLine = [], isLoading: shipsByCruiseLineLoading } = useShipsByCruiseLine(selectedCruiseLineId);
    const { mutateAsync: linkShips } = useLinkShips();
    
    const crew = crewData?.crew || [];

    const handleViewAll = () => {
        window.location.href = '/whos-in-port';
    };

    const handleLinkShips = async () => {
        try {
            await linkShips({
                shipId: selectedShipId,
                portName: "Current Port", // You might want to get this from user's current location
                date: today
            });
            setShowLinkModal(false);
            setSelectedCruiseLineId("");
            setSelectedShipId("");
        } catch (error) {
            console.error('Failed to link ships:', error);
        }
    };

    if (crewLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#069B93]">📍 Who's in Your Port</h3>
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

    return (
        <>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 lg:p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-3 lg:mb-4">
                    <h3 className="text-base lg:text-lg font-semibold text-[#069B93]">Who's in Your Port</h3>
                    <div className="flex items-center space-x-2">
                        <span className="bg-[#069B93] text-white text-xs px-2 py-1 rounded-full font-medium">
                            {crew.length}
                        </span>
                        <button
                            onClick={() => setShowLinkModal(true)}
                            className="px-2 py-1 bg-[#069B93] text-white text-xs rounded hover:bg-[#058a7a] transition-colors"
                        >
                            Link Ships
                        </button>
                    </div>
                </div>
                
                <div className="space-y-1 lg:space-y-2 mb-3 lg:mb-4">
                    {crew.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 lg:gap-2">
                            {crew.slice(0, 8).map((member) => (
                                <CrewMemberCard key={member.id} member={{
                                    id: member.id,
                                    name: member.display_name,
                                    role: member.ship_name,
                                    department: member.cruise_line_name,
                                    avatar: member.profile_photo || defaultAvatar,
                                    shipName: member.ship_name
                                }} />
                            ))}
                        </div>
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
                
                {/* View All Button */}
                {crew.length > 0 && (
                    <div className="flex justify-center">
                        <button
                            onClick={handleViewAll}
                            className="px-4 py-2 text-sm text-[#069B93] hover:text-[#058a7a] hover:bg-[#069B93]/5 rounded-lg transition-colors font-medium"
                        >
                            View All ({crew.length})
                        </button>
                    </div>
                )}
                
            </div>
            
            {/* Link Ships Modal */}
            {showLinkModal && (
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
                                        onChange={(e) => setSelectedCruiseLineId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                                    >
                                        <option value="">Select a cruise line</option>
                                        {cruiseLines.map((line: any) => (
                                            <option key={line.id} value={line.id}>
                                                {line.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Ship
                                </label>
                                {shipsByCruiseLineLoading ? (
                                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                        <span className="text-gray-500">Loading ships...</span>
                                    </div>
                                ) : (
                                    <select
                                        value={selectedShipId}
                                        onChange={(e) => setSelectedShipId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                                        disabled={!selectedCruiseLineId}
                                    >
                                        <option value="">Select a ship</option>
                                        {shipsByCruiseLine.map((ship: any) => (
                                            <option key={ship.id} value={ship.id}>
                                                {ship.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex space-x-3 mt-8">
                            <button
                                onClick={() => setShowLinkModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLinkShips}
                                disabled={!selectedCruiseLineId || !selectedShipId}
                                className="flex-1 px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Link Ships
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const DashboardSidebar = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => {
    const sidebarClasses = `
        fixed top-0 left-0 h-full bg-gray-900 text-white z-[9999] transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        w-64 lg:w-72
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `;

    const menuItems = [
        { name: 'Dashboard', icon: HiUsers, path: '/dashboard' },
        { name: 'Update Ship Location', icon: HiLocationMarker, path: '/ship-location' },
        { name: 'Discover Who\'s with You Today', icon: HiUsers, path: '/explore-ships' },
        { name: 'My Profile', icon: HiUsers, path: '/profile' },
        { name: 'Messages', icon: HiChat, path: '/messages' },
        { name: 'Favorites & Alerts', icon: HiBell, path: '/favorites' },
        { name: 'Notifications', icon: HiBell, path: '/notifications' },
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-[9998] lg:hidden"
                    onClick={onToggle}
                />
            )}
            
            {/* Sidebar */}
            <div className={sidebarClasses}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold">CrewVar</h2>
                        <button
                            onClick={onToggle}
                            className="lg:hidden text-white hover:text-gray-300"
                        >
                            <HiX className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <nav className="space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                                onClick={() => {
                                    // Close sidebar on mobile after navigation
                                    if (window.innerWidth < 1024) {
                                        onToggle();
                                    }
                                }}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </>
    );
};

const DashboardNew = () => {
    const { signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            window.location.href = '/auth/login';
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex flex-1">
                {/* Sidebar */}
                <DashboardSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
                
                {/* Main Content */}
                <div className="flex-1 lg:ml-72 flex flex-col">
                    {/* Simple Top Bar */}
                    <div className="bg-white shadow-sm border-b px-3 sm:px-4 lg:px-8 xl:px-12 py-3">
                        <div className="flex justify-between items-center">
                            <button
                                onClick={toggleSidebar}
                                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                                <HiMenu className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <div className="flex-1"></div>
                            <button
                                onClick={handleSignOut}
                                className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-3 sm:p-4 lg:p-6 xl:p-8 flex-1">
                        {/* Welcome Section - Compact Desktop Design */}
                        <div className="mb-4 lg:mb-6">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2 lg:mb-3">
                                Welcome to CrewVar Dashboard
                            </h2>
                            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-4xl">
                                Manage your cruise ship connections and crew interactions.
                            </p>
                        </div>


                        {/* Main Dashboard Cards - Equal Size */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-3">
                            {/* Today on Board */}
                            <div>
                                <TodayOnBoardCard onConnectClick={() => console.log('Connect clicked')} />
                            </div>

                            {/* Who's in Your Port */}
                            <div>
                                <WhosInPortCard />
                            </div>

                            {/* New Connections Pending */}
                            <div>
                                <ConnectionPendingCard />
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default DashboardNew;
import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCruiseLines, useAllShips, useShipsByCruiseLine } from "../../cruise/api/cruiseData";
import { useAllCrewQuery } from "../../connections/api/crewSearchApi";
import { useSendConnectionRequest } from "../../connections/api/connectionApi";
import { toast } from "react-toastify";
import logo from "../../../assets/images/Home/logo.png";

export const ExploreShips = () => {
    const navigate = useNavigate();
    const [selectedCruiseLine, setSelectedCruiseLine] = useState<string>("");
    const [selectedShip, setSelectedShip] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const observerRef = useRef<HTMLDivElement>(null);
    
    // Connection request mutation
    const sendConnectionRequestMutation = useSendConnectionRequest();

    // Fetch real data
    const { data: cruiseLines, isLoading: cruiseLinesLoading } = useCruiseLines();
    const { data: allShips, isLoading: shipsLoading } = useAllShips();
    
    // Get the cruise line ID from the selected name
    const selectedCruiseLineId = cruiseLines?.find(cl => cl.name === selectedCruiseLine)?.id || '';
    const { data: shipsByCruiseLine, isLoading: shipsByCruiseLineLoading } = useShipsByCruiseLine(selectedCruiseLineId);
    
    const {
        data: crewData,
        isLoading: crewLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage
    } = useAllCrewQuery();

    // Connection request handler
    const handleConnect = async (memberId: string, memberName: string) => {
        try {
            setLoadingStates(prev => ({ ...prev, [memberId]: true }));
            
            await sendConnectionRequestMutation.mutateAsync({
                receiverId: memberId,
                message: `Hi ${memberName}! I'd like to connect with you.`
            });
            
            toast.success(`Connection request sent to ${memberName}!`);
        } catch (error: any) {
            console.error('Failed to send connection request:', error);
            toast.error(error.response?.data?.error || 'Failed to send connection request');
        } finally {
            setLoadingStates(prev => ({ ...prev, [memberId]: false }));
        }
    };

    // View profile handler
    const handleViewProfile = (memberId: string) => {
        // Navigate to member's profile page
        window.location.href = `/crew/${memberId}`;
    };


    // Get available ships based on selected cruise line
    const availableShips = useMemo(() => {
        if (selectedCruiseLine && shipsByCruiseLine) {
            return shipsByCruiseLine;
        }
        // If no cruise line selected, show all ships
        if (!selectedCruiseLine && allShips) {
            return allShips;
        }
        return [];
    }, [selectedCruiseLine, shipsByCruiseLine, allShips]);

    // Flatten all crew data from all pages
    const allCrew = useMemo(() => {
        if (!crewData?.pages) return [];
        return crewData.pages.flatMap(page => page.crew);
    }, [crewData]);

    // Filter crew members based on selections (client-side filtering)
    const filteredCrew = useMemo(() => {
        if (!allCrew) return [];
        
        return allCrew.filter(member => {
            const matchesCruiseLine = !selectedCruiseLine || member.cruise_line_name === selectedCruiseLine;
            const matchesShip = !selectedShip || member.ship_name === selectedShip;
            const matchesSearch = !searchQuery || 
                member.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.department_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.role_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.ship_name.toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchesCruiseLine && matchesShip && matchesSearch;
        });
    }, [allCrew, selectedCruiseLine, selectedShip, searchQuery]);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Reset ship selection when cruise line changes
    const handleCruiseLineChange = (cruiseLineName: string) => {
        setSelectedCruiseLine(cruiseLineName);
        setSelectedShip(""); // Reset ship selection
    };

    // Debug logging
    console.log('ExploreShips Debug:', {
        cruiseLines: cruiseLines?.length || 0,
        allShips: allShips?.length || 0,
        crewData: allCrew.length || 0,
        crewDataFull: crewData,
        crewLoading,
        selectedCruiseLine,
        selectedCruiseLineId,
        availableShips: availableShips?.length || 0,
        shipsByCruiseLine: shipsByCruiseLine?.length || 0
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="bg-teal-600 text-white p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-teal-700 rounded-lg transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold">Explore Ships</h1>
                            <p className="text-xs text-teal-100">Find crew members</p>
                        </div>
                    </div>
                    <Link to="/dashboard" className="flex items-center space-x-2 hover:bg-teal-700 rounded-lg px-3 py-2 transition-colors">
                        <img 
                            src={logo} 
                            alt="Crewvar Logo" 
                            className="h-6 w-auto"
                        />
                        <span className="text-sm font-medium">Dashboard</span>
                    </Link>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Search Section */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h2 className="text-lg font-semibold text-teal-600 mb-3">Search & Filter</h2>
                    
                    <div className="space-y-3">
                        {/* Search Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search Crew Members
                            </label>
                            <input
                                type="text"
                                placeholder="Search by name, department, role, or ship..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none text-base"
                            />
                        </div>

                        {/* Cruise Line Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cruise Line
                            </label>
                            <select
                                value={selectedCruiseLine}
                                onChange={(e) => handleCruiseLineChange(e.target.value)}
                                disabled={cruiseLinesLoading}
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none text-base disabled:bg-gray-100"
                            >
                                <option value="">All Cruise Lines</option>
                                {cruiseLines?.map((cruiseLine) => (
                                    <option key={cruiseLine.id} value={cruiseLine.name}>
                                        {cruiseLine.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Ship Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ship
                            </label>
                            <select
                                value={selectedShip}
                                onChange={(e) => setSelectedShip(e.target.value)}
                                disabled={shipsLoading || shipsByCruiseLineLoading}
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none text-base disabled:bg-gray-100"
                            >
                                <option value="">All Ships</option>
                                {availableShips?.map((ship) => (
                                    <option key={ship.id} value={ship.name}>
                                        {ship.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {(cruiseLinesLoading || shipsLoading || crewLoading) && (
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                            <span className="ml-3 text-gray-600">Loading crew data...</span>
                        </div>
                    </div>
                )}


                {/* Crew Results */}
                {!crewLoading && (
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-teal-600">
                                Crew Members ({filteredCrew.length})
                            </h2>
                            <div className="text-sm text-gray-500">
                                {allCrew.length} total loaded
                            </div>
                        </div>

                        {filteredCrew.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-base">No crew members found</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {searchQuery || selectedCruiseLine || selectedShip 
                                        ? "Try adjusting your search or filters" 
                                        : "No crew data available"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredCrew.map((member) => (
                                    <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            {/* Avatar */}
                                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                                                {member.profile_photo ? (
                                                    <img 
                                                        src={member.profile_photo} 
                                                        alt={member.display_name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            // Fallback to letter avatar if image fails to load
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            const parent = target.parentElement;
                                                            if (parent) {
                                                                parent.innerHTML = `
                                                                    <div class="w-full h-full bg-teal-500 flex items-center justify-center">
                                                                        <span class="text-white font-bold text-lg">${member.display_name.charAt(0)}</span>
                                                                    </div>
                                                                `;
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-teal-500 flex items-center justify-center">
                                                        <span className="text-white font-bold text-lg">
                                                            {member.display_name.charAt(0)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Member Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-semibold text-gray-900 truncate">
                                                    {member.display_name}
                                                </h3>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {member.role_name || 'Crew Member'}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {member.department_name} • {member.ship_name}
                                                </p>
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleConnect(member.id, member.display_name)}
                                                    disabled={loadingStates[member.id] || sendConnectionRequestMutation.isLoading}
                                                    className="px-3 py-2 bg-[#069B93] text-white text-sm font-medium rounded-lg hover:bg-[#058a7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {loadingStates[member.id] ? 'Sending...' : 'Connect'}
                                                </button>
                                                <button
                                                    onClick={() => handleViewProfile(member.id)}
                                                    className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:border-[#069B93] hover:text-[#069B93] hover:bg-[#069B93]/5 transition-colors font-medium"
                                                >
                                                    View Profile
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Infinite scroll loading indicator */}
                                {isFetchingNextPage && (
                                    <div className="flex justify-center py-4">
                                        <div className="flex items-center space-x-2 text-teal-600">
                                            <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium">Loading more crew members...</span>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Infinite scroll trigger */}
                                <div ref={observerRef} className="h-4"></div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUpdateShipAssignment } from "../../user/api/shipAssignmentApi";
import { useCruiseLines, useAllShips, useShipsByCruiseLine } from "../../cruise/api/cruiseData";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../app/api";

export const ShipAssignment = () => {
    const navigate = useNavigate();
    const [selectedCruiseLineId, setSelectedCruiseLineId] = useState<string>("");
    const [selectedShipId, setSelectedShipId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const updateShipAssignmentMutation = useUpdateShipAssignment();
    const { data: userProfile } = useQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            const response = await api.get('/users/profile');
            return response.data;
        }
    });
    const { data: cruiseLines, isLoading: cruiseLinesLoading } = useCruiseLines();
    const { data: allShips, isLoading: shipsLoading } = useAllShips();
    const { data: shipsByCruiseLine, isLoading: shipsByCruiseLineLoading } = useShipsByCruiseLine(selectedCruiseLineId);

    // Initialize with user's current ship
    useEffect(() => {
        if (userProfile?.user?.current_ship_id) {
            const currentShip = allShips?.find(ship => ship.id === userProfile.user.current_ship_id);
            if (currentShip) {
                setSelectedCruiseLineId(currentShip.cruise_line_id);
                setSelectedShipId(currentShip.id);
            }
        }
    }, [userProfile, allShips]);

    // Get available ships based on selected cruise line
    const availableShips = selectedCruiseLineId && shipsByCruiseLine ? shipsByCruiseLine : allShips || [];

    const handleSave = async () => {
        if (!selectedShipId) {
            alert('Please select a ship');
            return;
        }

        setIsLoading(true);
        
        try {
            await updateShipAssignmentMutation.mutateAsync({
                currentShipId: selectedShipId
            });
            
            // Also save to localStorage for quick access
            const selectedShip = availableShips.find(ship => ship.id === selectedShipId);
            if (selectedShip) {
                const today = new Date().toISOString().split('T')[0];
                const shipAssignment = {
                    shipId: selectedShip.id,
                    shipName: selectedShip.name,
                    port: "Current Port",
                    date: today,
                    isConfirmed: true
                };
                
                localStorage.setItem('currentShipAssignment', JSON.stringify(shipAssignment));
                localStorage.setItem('lastShipConfirmation', today);
            }
            
            alert('Ship assignment updated successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to update ship assignment:', error);
            alert('Failed to update ship assignment. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCruiseLineChange = (cruiseLineId: string) => {
        setSelectedCruiseLineId(cruiseLineId);
        setSelectedShipId(""); // Reset ship selection when cruise line changes
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <div className="bg-teal-600 text-white p-4 sticky top-0 z-10">
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
                        <h1 className="text-lg font-bold">Update Ship Assignment</h1>
                        <p className="text-xs text-teal-100">Change your current ship</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Current Assignment Info */}
                {userProfile?.user?.current_ship_id && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-800 mb-2">Current Assignment</h3>
                        <p className="text-sm text-blue-600">
                            {(() => {
                                const currentShip = allShips?.find(ship => ship.id === userProfile.user.current_ship_id);
                                const currentCruiseLine = cruiseLines?.find(cl => cl.id === currentShip?.cruise_line_id);
                                return currentShip && currentCruiseLine 
                                    ? `${currentShip.name} • ${currentCruiseLine.name}`
                                    : 'Loading...';
                            })()}
                        </p>
                    </div>
                )}

                {/* Ship Selection */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h2 className="text-lg font-semibold text-teal-600 mb-4">Select New Ship Assignment</h2>
                    
                    <div className="space-y-4">
                        {/* Cruise Line Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cruise Line
                            </label>
                            <select
                                value={selectedCruiseLineId}
                                onChange={(e) => handleCruiseLineChange(e.target.value)}
                                disabled={cruiseLinesLoading}
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none text-base disabled:bg-gray-100"
                            >
                                <option value="">Select Cruise Line</option>
                                {cruiseLines?.map((cruiseLine) => (
                                    <option key={cruiseLine.id} value={cruiseLine.id}>
                                        {cruiseLine.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Ship Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ship
                            </label>
                            <select
                                value={selectedShipId}
                                onChange={(e) => setSelectedShipId(e.target.value)}
                                disabled={shipsLoading || shipsByCruiseLineLoading || !selectedCruiseLineId}
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none text-base disabled:bg-gray-100"
                            >
                                <option value="">Select Ship</option>
                                {availableShips?.map((ship) => (
                                    <option key={ship.id} value={ship.id}>
                                        {ship.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                            <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs">⚠</span>
                            </div>
                            <div>
                                <h4 className="font-medium text-yellow-800 text-sm">Important</h4>
                                <p className="text-xs text-yellow-700 mt-1">
                                    This will update your current ship assignment. Other crew members will see your new ship assignment immediately.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex space-x-3">
                        <button
                            onClick={() => navigate(-1)}
                            disabled={isLoading || updateShipAssignmentMutation.isLoading}
                            className="flex-1 px-4 py-3 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!selectedShipId || isLoading || updateShipAssignmentMutation.isLoading}
                            className="flex-1 px-4 py-3 text-white bg-teal-600 hover:bg-teal-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading || updateShipAssignmentMutation.isLoading ? 'Updating...' : 'Update Assignment'}
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="text-lg font-semibold text-teal-600 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 gap-3">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="p-3 text-left border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"
                        >
                            <h4 className="font-medium text-gray-900">Dashboard</h4>
                            <p className="text-sm text-gray-600">View your daily crew updates</p>
                        </button>
                        <button 
                            onClick={() => navigate('/my-profile')}
                            className="p-3 text-left border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"
                        >
                            <h4 className="font-medium text-gray-900">My Profile</h4>
                            <p className="text-sm text-gray-600">Edit your profile details</p>
                        </button>
                        <button 
                            onClick={() => navigate('/explore-ships')}
                            className="p-3 text-left border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors"
                        >
                            <h4 className="font-medium text-gray-900">Explore Ships</h4>
                            <p className="text-sm text-gray-600">Find crew members on other ships</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

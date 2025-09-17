import { useState, useEffect } from "react";
import { sampleCruiseLines } from "../data/onboarding-data";
import { ShipSelection } from "./ShipSelection";
import { useUpdateShipAssignment } from "../features/user/api/shipAssignmentApi";
import { useAllShips } from "../features/cruise/api/cruiseData";

interface QuickCheckInProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (shipId: string, shipName: string) => void;
    currentShip?: string;
    isLoading?: boolean;
}

export const QuickCheckIn = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    currentShip,
    isLoading = false 
}: QuickCheckInProps) => {
    const [selectedCruiseLineId, setSelectedCruiseLineId] = useState<string>("");
    const [selectedShipId, setSelectedShipId] = useState<string>("");
    const updateShipAssignmentMutation = useUpdateShipAssignment();
    const { data: allShips } = useAllShips();

    useEffect(() => {
        if (isOpen) {
            setSelectedShipId(currentShip || "");
            setSelectedCruiseLineId("");
        }
    }, [isOpen, currentShip]);

    const handleConfirm = async () => {
        console.log('handleConfirm called with selectedShipId:', selectedShipId);
        
        if (selectedShipId) {
            // Try to find ship in real data first, fallback to sample data
            let ship = allShips?.find(s => s.id === selectedShipId);
            
            // Fallback to sample data if not found in real data
            if (!ship) {
                const sampleShips = sampleCruiseLines.flatMap(cl => cl.ships);
                const sampleShip = sampleShips.find(s => s.id === selectedShipId);
                if (sampleShip) {
                    // Convert sample ship to match expected interface
                    ship = {
                        id: sampleShip.id,
                        name: sampleShip.name,
                        cruise_line_id: '', // Will be set by parent
                        is_active: true,
                        created_at: '',
                        updated_at: ''
                    };
                }
            }
            
            if (ship) {
                console.log('Found ship:', ship);
                try {
                    // Update ship assignment in database
                    await updateShipAssignmentMutation.mutateAsync({
                        currentShipId: ship.id
                    });
                    
                    // Also save to localStorage for quick access
                    const today = new Date().toISOString().split('T')[0];
                    const shipAssignment = {
                        shipId: ship.id,
                        shipName: ship.name,
                        port: "Current Port", // This would come from ship data
                        date: today,
                        isConfirmed: true
                    };
                    
                    localStorage.setItem('currentShipAssignment', JSON.stringify(shipAssignment));
                    localStorage.setItem('lastShipConfirmation', today);
                    
                    // Call the original onConfirm callback
                    onConfirm(ship.id, ship.name);
                    
                    console.log(`Ship assignment updated: ${ship.name} for ${today}`);
                } catch (error) {
                    console.error('Failed to update ship assignment:', error);
                    // Still call onConfirm for UI feedback, but show error
                    onConfirm(ship.id, ship.name);
                }
            } else {
                console.error('Ship not found with ID:', selectedShipId);
                console.log('Available ships:', allShips?.length || 0);
            }
        } else {
            console.error('No ship selected');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-[#069B93] text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Quick Check-In</h2>
                            <p className="text-[#B9F3DF] mt-1">
                                Confirm your ship for today. We'll only show today's ship to others.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-[#B9F3DF] transition-colors text-2xl font-bold"
                            disabled={isLoading}
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="mb-6">
                        <ShipSelection
                            selectedCruiseLineId={selectedCruiseLineId}
                            selectedShipId={selectedShipId}
                            onCruiseLineChange={setSelectedCruiseLineId}
                            onShipChange={setSelectedShipId}
                            placeholder="Select your ship for today"
                        />
                    </div>

                    {/* Privacy Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-white text-xs">ℹ</span>
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-900">Privacy Notice</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    Only your current ship assignment for today will be visible to other crew members. 
                                    Future ship assignments remain private.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-4">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-6 py-3 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                console.log('Confirm button clicked');
                                console.log('selectedShipId:', selectedShipId);
                                console.log('isLoading:', isLoading);
                                console.log('mutationLoading:', updateShipAssignmentMutation.isLoading);
                                handleConfirm();
                            }}
                            disabled={!selectedShipId || isLoading || updateShipAssignmentMutation.isLoading}
                            className="flex-1 px-6 py-3 text-white bg-[#069B93] hover:bg-[#058a7a] rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading || updateShipAssignmentMutation.isLoading ? 'Updating...' : 'Confirm Ship'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

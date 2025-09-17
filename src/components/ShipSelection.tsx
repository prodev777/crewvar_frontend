import { useEffect } from "react";
import { useCruiseLines, useShipsByCruiseLine } from "../features/cruise/api/cruiseData";

interface ShipSelectionProps {
    selectedCruiseLineId?: string;
    selectedShipId?: string;
    onCruiseLineChange: (cruiseLineId: string) => void;
    onShipChange: (shipId: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export const ShipSelection = ({
    selectedCruiseLineId = "",
    selectedShipId = "",
    onCruiseLineChange,
    onShipChange,
    placeholder = "Select your ship",
    disabled = false,
    className = ""
}: ShipSelectionProps) => {
    const { data: cruiseLines = [], isLoading: cruiseLinesLoading } = useCruiseLines();
    const { data: availableShips = [], isLoading: shipsLoading } = useShipsByCruiseLine(selectedCruiseLineId);

    // Reset ship selection when cruise line changes
    useEffect(() => {
        if (selectedCruiseLineId && selectedShipId) {
            const ship = availableShips.find(s => s.id === selectedShipId);
            if (!ship) {
                onShipChange("");
            }
        }
    }, [selectedCruiseLineId, availableShips, selectedShipId, onShipChange]);

    const handleCruiseLineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cruiseLineId = e.target.value;
        onCruiseLineChange(cruiseLineId);
        onShipChange(""); // Reset ship selection
    };

    const handleShipChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onShipChange(e.target.value);
    };

    const selectedCruiseLine = cruiseLines.find(cl => cl.id === selectedCruiseLineId);
    const selectedShip = availableShips.find(s => s.id === selectedShipId);

    if (cruiseLinesLoading) {
        return (
            <div className={`space-y-4 ${className}`}>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                </div>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Step 1: Cruise Line Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step 1: Select Cruise Line
                </label>
                <select
                    value={selectedCruiseLineId}
                    onChange={handleCruiseLineChange}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                    <option value="">Choose a cruise line...</option>
                    {cruiseLines.map((cruiseLine) => (
                        <option key={cruiseLine.id} value={cruiseLine.id}>
                            {cruiseLine.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Step 2: Ship Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Step 2: Select Ship
                </label>
                <select
                    value={selectedShipId}
                    onChange={handleShipChange}
                    disabled={disabled || !selectedCruiseLineId || shipsLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                    <option value="">
                        {!selectedCruiseLineId 
                            ? "First select a cruise line..." 
                            : shipsLoading
                                ? "Loading ships..."
                                : availableShips.length === 0 
                                    ? "No ships available" 
                                    : placeholder
                        }
                    </option>
                    {availableShips.map((ship) => (
                        <option key={ship.id} value={ship.id}>
                            {ship.name} {ship.home_port && `(${ship.home_port})`}
                        </option>
                    ))}
                </select>
            </div>

            {/* Selection Summary */}
            {selectedCruiseLineId && selectedShipId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-800">
                            Selected: {selectedCruiseLine?.name} - {selectedShip?.name}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

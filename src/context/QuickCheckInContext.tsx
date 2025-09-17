import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUpdateShipAssignment } from "../features/user/api/shipAssignmentApi";
import { useUserProfile } from "../features/auth/api/userProfile";
import { useAllShips } from "../features/cruise/api/cruiseData";

interface ShipAssignment {
    shipId: string;
    shipName: string;
    port: string;
    date: string; // YYYY-MM-DD format
    isConfirmed: boolean;
}

interface QuickCheckInContextType {
    currentShip: ShipAssignment | null;
    showCheckInDialog: boolean;
    setCurrentShip: (ship: ShipAssignment) => void;
    setShowCheckInDialog: (show: boolean) => void;
    confirmShipAssignment: (shipId: string, shipName: string) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    onClose: () => void;
}

const QuickCheckInContext = createContext<QuickCheckInContextType | undefined>(undefined);

export const useQuickCheckIn = () => {
    const context = useContext(QuickCheckInContext);
    if (context === undefined) {
        throw new Error('useQuickCheckIn must be used within a QuickCheckInProvider');
    }
    return context;
};

interface QuickCheckInProviderProps {
    children: ReactNode;
}

export const QuickCheckInProvider = ({ children }: QuickCheckInProviderProps) => {
    const [currentShip, setCurrentShip] = useState<ShipAssignment | null>(null);
    const [showCheckInDialog, setShowCheckInDialog] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const updateShipAssignmentMutation = useUpdateShipAssignment();
    const { data: userProfile } = useUserProfile();
    const { data: allShips = [] } = useAllShips();

    // Check if user needs to confirm ship assignment on login
    useEffect(() => {
        // Simulate checking if user has confirmed today's ship
        const today = new Date().toISOString().split('T')[0];
        const lastConfirmedDate = localStorage.getItem('lastShipConfirmation');
        const onboardingComplete = localStorage.getItem('onboardingComplete');
        
        // Show check-in dialog if:
        // 1. User hasn't confirmed today's ship, OR
        // 2. User just completed onboarding (first time)
        if (lastConfirmedDate !== today || onboardingComplete === 'true') {
            setShowCheckInDialog(true);
            // Clear onboarding flag after showing dialog
            if (onboardingComplete === 'true') {
                localStorage.removeItem('onboardingComplete');
            }
        } else {
            // Load saved ship assignment
            const savedShip = localStorage.getItem('currentShipAssignment');
            if (savedShip) {
                setCurrentShip(JSON.parse(savedShip));
            }
        }
    }, []);

    // Sync with user profile ship assignment
    useEffect(() => {
        if (userProfile?.current_ship_id && allShips.length > 0) {
            const ship = allShips.find((s: any) => s.id === userProfile.current_ship_id);
            if (ship) {
                const today = new Date().toISOString().split('T')[0];
                const profileShip: ShipAssignment = {
                    shipId: userProfile.current_ship_id,
                    shipName: ship.name,
                    port: "Current Port", // This would come from ship data
                    date: today,
                    isConfirmed: true
                };
                
                // Only set if we don't have a current ship or if it's different
                if (!currentShip || currentShip.shipId !== profileShip.shipId) {
                    setCurrentShip(profileShip);
                    // Also save to localStorage for consistency
                    localStorage.setItem('currentShipAssignment', JSON.stringify(profileShip));
                }
            }
        }
    }, [userProfile?.current_ship_id, allShips, currentShip]);

    const confirmShipAssignment = async (shipId: string, shipName: string) => {
        setIsLoading(true);
        
        try {
            // Update ship assignment in database
            await updateShipAssignmentMutation.mutateAsync({
                currentShipId: shipId
            });
            
            const today = new Date().toISOString().split('T')[0];
            const shipAssignment: ShipAssignment = {
                shipId,
                shipName,
                port: "Current Port", // This would come from ship data
                date: today,
                isConfirmed: true
            };
            
            // Save to localStorage for quick access
            localStorage.setItem('currentShipAssignment', JSON.stringify(shipAssignment));
            localStorage.setItem('lastShipConfirmation', today);
            
            setCurrentShip(shipAssignment);
            setShowCheckInDialog(false);
            
            console.log(`Ship assignment updated in database: ${shipName} for ${today}`);
        } catch (error) {
            console.error('Failed to confirm ship assignment:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const value: QuickCheckInContextType = {
        currentShip,
        showCheckInDialog,
        setCurrentShip,
        setShowCheckInDialog,
        confirmShipAssignment,
        isLoading,
        setIsLoading,
        onClose: () => setShowCheckInDialog(false)
    };

    return (
        <QuickCheckInContext.Provider value={value}>
            {children}
        </QuickCheckInContext.Provider>
    );
};

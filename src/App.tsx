import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";
import { OnboardingGuardProvider } from "./context/OnboardingGuardContext";
import { CalendarProvider } from "./context/CalendarContext";
import { NotificationProvider } from "./context/NotificationContext";
import { RealtimeProvider } from "./context/RealtimeContext";
import { QuickCheckInProvider } from "./context/QuickCheckInContext";
import { PortConnectionProvider } from "./context/PortConnectionContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { AppRoutes } from "./routes";
import { OnboardingGuard } from "./components/OnboardingGuard";

const AppContent = () => {
    return (
        <>
            <OnboardingGuard>
                <AppRoutes />
            </OnboardingGuard>
        </>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <RealtimeProvider>
                <OnboardingGuardProvider>
                    <CalendarProvider>
                        <NotificationProvider>
                            <QuickCheckInProvider>
                                <PortConnectionProvider>
                                    <FavoritesProvider>
                                        <ToastContainer 
                                            autoClose={3500}
                                            draggable={false}
                                            pauseOnHover={false}
                                        />
                                        <AppContent />
                                    </FavoritesProvider>
                                </PortConnectionProvider>
                            </QuickCheckInProvider>
                        </NotificationProvider>
                    </CalendarProvider>
                </OnboardingGuardProvider>
            </RealtimeProvider>
        </AuthProvider>
    );
};

export default App;
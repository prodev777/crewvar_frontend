import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    HiMenu, 
    HiX, 
    HiLocationMarker, 
    HiUsers, 
    HiUser, 
    HiChat, 
    HiHeart, 
    HiBell,
    HiHome,
    HiChevronRight
} from 'react-icons/hi';

interface SidebarItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    badge?: number;
}

const sidebarItems: SidebarItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: HiHome,
        path: '/dashboard'
    },
    {
        id: 'ship-location',
        label: 'Update Ship Location',
        icon: HiLocationMarker,
        path: '/ship-location'
    },
    {
        id: 'discover',
        label: "Discover Who's with You Today",
        icon: HiUsers,
        path: '/explore-ships'
    },
    {
        id: 'profile',
        label: 'My Profile',
        icon: HiUser,
        path: '/profile'
    },
    {
        id: 'messages',
        label: 'Messages',
        icon: HiChat,
        path: '/messages'
    },
    {
        id: 'favorites',
        label: 'Favorites & Alerts',
        icon: HiHeart,
        path: '/favorites'
    },
    {
        id: 'notifications',
        label: 'Notifications',
        icon: HiBell,
        path: '/notifications'
    }
];

interface DashboardSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onToggle }) => {
    const location = useLocation();
    const { currentUser } = useAuth();

    // Debug logging
    console.log('DashboardSidebar rendered, isOpen:', isOpen);
    
    const sidebarClasses = `
        fixed top-0 left-0 h-full bg-gray-900 text-white z-[9999] transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        w-64 lg:w-72
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `;
    console.log('Sidebar classes:', sidebarClasses);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        const handleRouteChange = () => {
            if (window.innerWidth < 1024 && isOpen) {
                onToggle();
            }
        };

        handleRouteChange();
    }, [location.pathname, isOpen, onToggle]);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-[9998] lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <div className={sidebarClasses}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#069B93] to-[#058a7a] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">C</span>
                        </div>
                        <h1 className="text-lg lg:text-xl font-bold text-white">CrewConnect</h1>
                    </div>
                    <button
                        onClick={onToggle}
                        className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <HiX className="w-5 h-5 lg:w-6 lg:h-6" />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="mt-4 lg:mt-6 px-3 lg:px-4">
                    <ul className="space-y-1 lg:space-y-2">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            
                            return (
                                <li key={item.id}>
                                    <Link
                                        to={item.path}
                                        className={`
                                            flex items-center justify-between px-3 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl transition-all duration-200 group
                                            ${isActive 
                                                ? 'bg-gradient-to-r from-[#069B93] to-[#058a7a] text-white shadow-lg' 
                                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                                            <span className="font-medium text-sm lg:text-base">{item.label}</span>
                                        </div>
                                        
                                        {/* Badge for notifications */}
                                        {item.id === 'notifications' && (
                                            <div className="bg-red-500 text-white text-xs rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center font-bold">
                                                3
                                            </div>
                                        )}
                                        
                                        {/* Active indicator */}
                                        {isActive && (
                                            <HiChevronRight className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 border-t border-gray-700">
                    <div className="flex items-center space-x-3 p-2 lg:p-3 rounded-lg lg:rounded-xl bg-gray-800">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-[#069B93] to-[#058a7a] rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs lg:text-sm">
                                {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs lg:text-sm font-medium text-white truncate">
                                {currentUser?.displayName || 'User'}
                            </p>
                            <p className="text-xs text-gray-400 truncate">Crew Member</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Debug initial state
    console.log('DashboardLayout initialized, sidebarOpen:', sidebarOpen);

    const toggleSidebar = () => {
        console.log('Toggle sidebar clicked, current state:', sidebarOpen);
        const newState = !sidebarOpen;
        setSidebarOpen(newState);
        console.log('New sidebar state:', newState);
    };

    // Close sidebar on window resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <DashboardSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
            
            {/* Main Content */}
            <div className="lg:ml-72">
                {/* Top Bar */}
                <div className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 lg:space-x-4">
                            <button
                                onClick={toggleSidebar}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <HiMenu className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
                            </button>
                            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h2>
                        </div>
                        
                        {/* Right side actions */}
                        <div className="flex items-center space-x-3 lg:space-x-4">
                            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                <HiBell className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
                            </button>
                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-[#069B93] to-[#058a7a] rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-xs lg:text-sm">JD</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Page Content */}
                <div className="p-4 lg:p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};


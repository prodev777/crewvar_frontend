import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

export interface IRealtimeContext {
    socket: Socket | null;
    isConnected: boolean;
    onlineUsers: string[];
    typingUsers: { [roomId: string]: string[] };
    sendMessage: (roomId: string, message: string) => void;
    joinRoom: (roomId: string) => void;
    leaveRoom: (roomId: string) => void;
    startTyping: (roomId: string) => void;
    stopTyping: (roomId: string) => void;
    updateUserStatus: (status: 'online' | 'away' | 'busy' | 'offline') => void;
}

const RealtimeContext = createContext<IRealtimeContext | undefined>(undefined);

export const useRealtime = () => {
    const context = useContext(RealtimeContext);
    if (context === undefined) {
        throw new Error('useRealtime must be used within a RealtimeProvider');
    }
    return context;
};

interface RealtimeProviderProps {
    children: ReactNode;
}

export const RealtimeProvider = ({ children }: RealtimeProviderProps) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [typingUsers, setTypingUsers] = useState<{ [roomId: string]: string[] }>({});
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (token) {
                // Initialize socket connection
                const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
                    auth: {
                        token: token,
                        userId: currentUser.uid
                    },
                    transports: ['websocket', 'polling']
                });

            // Connection events
            newSocket.on('connect', () => {
                console.log('Connected to real-time server');
                setIsConnected(true);
                // Join user's personal room
                newSocket.emit('join_user_room', currentUser.uid);
            });

            newSocket.on('disconnect', () => {
                console.log('Disconnected from real-time server');
                setIsConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setIsConnected(false);
            });

            // User status events
            newSocket.on('user_online', (userId: string) => {
                setOnlineUsers(prev => {
                    if (!prev.includes(userId)) {
                        return [...prev, userId];
                    }
                    return prev;
                });
            });

            newSocket.on('user_offline', (userId: string) => {
                setOnlineUsers(prev => prev.filter(id => id !== userId));
            });

            newSocket.on('online_users', (users: string[]) => {
                setOnlineUsers(users);
            });

            // Typing events
            newSocket.on('user_typing', (data: { roomId: string; userId: string; userName: string }) => {
                setTypingUsers(prev => ({
                    ...prev,
                    [data.roomId]: [
                        ...(prev[data.roomId] || []).filter(id => id !== data.userId),
                        data.userName
                    ]
                }));
            });

            newSocket.on('user_stopped_typing', (data: { roomId: string; userId: string }) => {
                setTypingUsers(prev => ({
                    ...prev,
                    [data.roomId]: (prev[data.roomId] || []).filter(userName => userName !== data.userId)
                }));
            });

            // Clear typing users after 3 seconds
            newSocket.on('clear_typing', (roomId: string) => {
                setTypingUsers(prev => ({
                    ...prev,
                    [roomId]: []
                }));
            });

            // Notification events
            newSocket.on('new_notification', (notification: any) => {
                console.log('🔔 New notification received:', notification);
                // Emit custom event for notification context to handle
                window.dispatchEvent(new CustomEvent('realtime-notification', { 
                    detail: notification 
                }));
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
            }
        }
    }, [currentUser]);

    // Socket action functions
    const sendMessage = (roomId: string, message: string) => {
        if (socket && isConnected) {
            socket.emit('send_message', {
                roomId,
                message,
                userId: currentUser?.uid,
                timestamp: new Date().toISOString()
            });
        }
    };

    const joinRoom = (roomId: string) => {
        if (socket && isConnected) {
            socket.emit('join_room', roomId);
        }
    };

    const leaveRoom = (roomId: string) => {
        if (socket && isConnected) {
            socket.emit('leave_room', roomId);
        }
    };

    const startTyping = (roomId: string) => {
        if (socket && isConnected && currentUser) {
            socket.emit('start_typing', {
                roomId,
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Unknown User'
            });
        }
    };

    const stopTyping = (roomId: string) => {
        if (socket && isConnected && currentUser) {
            socket.emit('stop_typing', {
                roomId,
                userId: currentUser.uid
            });
        }
    };

    const updateUserStatus = (status: 'online' | 'away' | 'busy' | 'offline') => {
        if (socket && isConnected) {
            socket.emit('update_status', { status });
        }
    };

    const value: IRealtimeContext = {
        socket,
        isConnected,
        onlineUsers,
        typingUsers,
        sendMessage,
        joinRoom,
        leaveRoom,
        startTyping,
        stopTyping,
        updateUserStatus
    };

    return (
        <RealtimeContext.Provider value={value}>
            {children}
        </RealtimeContext.Provider>
    );
};

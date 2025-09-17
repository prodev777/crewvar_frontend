import { useState, useEffect, useRef } from 'react';
import { useRealtime } from '../context/RealtimeContext';
import { useAuth } from '../context/AuthContext';

interface Message {
    id: string;
    roomId: string;
    userId: string;
    userName: string;
    message: string;
    timestamp: string;
    isOwn?: boolean;
}

interface UseRealtimeChatProps {
    roomId: string;
    initialMessages?: Message[];
}

export const useRealtimeChat = ({ roomId, initialMessages = [] }: UseRealtimeChatProps) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { socket, isConnected, joinRoom, leaveRoom, startTyping, stopTyping } = useRealtime();
    const { currentUser } = useAuth();

    // Join room when component mounts or roomId changes
    useEffect(() => {
        if (isConnected && roomId) {
            joinRoom(roomId);
        }

        return () => {
            if (isConnected && roomId) {
                leaveRoom(roomId);
            }
        };
    }, [isConnected, roomId, joinRoom, leaveRoom]);

    // Listen for new messages
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message: Message) => {
            setMessages(prev => {
                // Check if message already exists to prevent duplicates
                const exists = prev.some(msg => msg.id === message.id);
                if (exists) return prev;
                
                return [...prev, {
                    ...message,
                    isOwn: message.userId === currentUser?.uid
                }];
            });
        };

        const handleUserTyping = (data: { roomId: string; userId: string; userName: string }) => {
            if (data.roomId === roomId) {
                setTypingUsers(prev => {
                    if (!prev.includes(data.userName)) {
                        return [...prev, data.userName];
                    }
                    return prev;
                });
            }
        };

        const handleUserStoppedTyping = (data: { roomId: string; userId: string }) => {
            if (data.roomId === roomId) {
                setTypingUsers(prev => prev.filter(user => user !== data.userId));
            }
        };

        const handleClearTyping = (data: { roomId: string }) => {
            if (data.roomId === roomId) {
                setTypingUsers([]);
            }
        };

        socket.on('new_message', handleNewMessage);
        socket.on('user_typing', handleUserTyping);
        socket.on('user_stopped_typing', handleUserStoppedTyping);
        socket.on('clear_typing', handleClearTyping);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('user_typing', handleUserTyping);
            socket.off('user_stopped_typing', handleUserStoppedTyping);
            socket.off('clear_typing', handleClearTyping);
        };
    }, [socket, roomId, currentUser?.uid]);

    const sendMessage = (message: string) => {
        if (isConnected && message.trim()) {
            const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const newMessage: Message = {
                id: messageId,
                roomId,
                userId: currentUser?.uid || '',
                userName: currentUser?.displayName || 'Unknown User',
                message: message.trim(),
                timestamp: new Date().toISOString(),
                isOwn: true
            };

            // Add message optimistically
            setMessages(prev => [...prev, newMessage]);

            // Send via socket
            socket?.emit('send_message', {
                roomId,
                message: message.trim(),
                userId: currentUser?.uid,
                userName: currentUser?.displayName || 'Unknown User',
                timestamp: new Date().toISOString()
            });

            // Stop typing
            handleStopTyping();
        }
    };

    const handleStartTyping = () => {
        if (!isTyping && isConnected) {
            setIsTyping(true);
            startTyping(roomId);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
            handleStopTyping();
        }, 3000);
    };

    const handleStopTyping = () => {
        if (isTyping && isConnected) {
            setIsTyping(false);
            stopTyping(roomId);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    };

    const getTypingText = () => {
        if (typingUsers.length === 0) return '';
        if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
        if (typingUsers.length === 2) return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
        return `${typingUsers[0]} and ${typingUsers.length - 1} others are typing...`;
    };

    return {
        messages,
        isConnected,
        typingUsers,
        typingText: getTypingText(),
        sendMessage,
        handleStartTyping,
        handleStopTyping
    };
};

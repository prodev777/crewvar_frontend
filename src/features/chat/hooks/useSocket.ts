import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from "../../../context/AuthContext";

export const useSocket = () => {
  const { currentUser } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!currentUser?.uid) return;

    // Initialize socket connection
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: {
        userId: currentUser.uid
      }
    });

    const socket = socketRef.current;

    // Join user's room
    socket.emit('join-room', currentUser.uid);

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [currentUser?.uid]);

  const emitEvent = (event: string, data: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  const onEvent = (event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const offEvent = (event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return {
    socket: socketRef.current,
    emitEvent,
    onEvent,
    offEvent,
    isConnected: socketRef.current?.connected || false
  };
};

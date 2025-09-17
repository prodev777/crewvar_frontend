import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../app/api';

// Types
export interface IChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read';
  timestamp: string;
  sender_name?: string;
  sender_avatar?: string;
}

export interface IChatRoom {
  room_id: string;
  participant1_id: string;
  participant2_id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string;
  other_user_online: boolean;
  other_user_last_seen: string;
  last_message_content?: string;
  last_message_time?: string;
  last_message_status?: string;
  last_message_sender_id?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface IUserOnlineStatus {
  is_online: boolean;
  last_seen: string;
}

// API functions
const chatApi = {
  // Get all chat rooms for current user
  getChatRooms: async (): Promise<IChatRoom[]> => {
    const response = await api.get('/chat/rooms');
    return response.data.rooms;
  },

  // Get messages with a specific user
  getChatMessages: async (otherUserId: string): Promise<{ roomId: string; messages: IChatMessage[] }> => {
    const response = await api.get(`/chat/messages/${otherUserId}`);
    return {
      roomId: response.data.roomId,
      messages: response.data.messages
    };
  },

  // Send a message
  sendMessage: async (data: { receiverId: string; content: string; messageType?: string }): Promise<IChatMessage> => {
    const response = await api.post('/chat/send', data);
    return response.data.message;
  },

  // Update message status
  updateMessageStatus: async (data: { messageId: string; status: string }): Promise<void> => {
    await api.put('/chat/message-status', data);
  },

  // Update online status
  updateOnlineStatus: async (isOnline: boolean): Promise<void> => {
    await api.put('/chat/online-status', { isOnline });
  },

  // Get user online status
  getUserOnlineStatus: async (userId: string): Promise<IUserOnlineStatus> => {
    const response = await api.get(`/chat/user-status/${userId}`);
    return response.data.status;
  }
};

// React Query hooks
export const useChatRooms = () => {
  return useQuery({
    queryKey: ['chatRooms'],
    queryFn: chatApi.getChatRooms,
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!localStorage.getItem('token') // Only run when user is authenticated
  });
};

export const useChatMessages = (otherUserId: string) => {
  return useQuery({
    queryKey: ['chatMessages', otherUserId],
    queryFn: () => {
      console.log('Fetching chat messages for user:', otherUserId);
      return chatApi.getChatMessages(otherUserId);
    },
    enabled: !!otherUserId && !!localStorage.getItem('token'), // Only run when user is authenticated and otherUserId is provided
    refetchInterval: 10000, // Refetch every 10 seconds
    onSuccess: (data) => {
      console.log('Chat messages fetched:', data);
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: chatApi.sendMessage,
    onSuccess: (newMessage, variables) => {
      console.log('useSendMessage onSuccess:', { newMessage, variables });
      
      // Update chat messages cache
      queryClient.setQueryData(['chatMessages', variables.receiverId], (oldData: any) => {
        console.log('Updating chat messages cache:', { oldData, newMessage });
        if (!oldData) return oldData;
        return {
          ...oldData,
          messages: [...oldData.messages, newMessage]
        };
      });

      // Update chat rooms cache
      queryClient.setQueryData(['chatRooms'], (oldData: IChatRoom[] | undefined) => {
        console.log('Updating chat rooms cache:', { oldData, newMessage });
        if (!oldData) return oldData;
        return oldData.map(room => {
          if (room.other_user_id === variables.receiverId) {
            return {
              ...room,
              last_message_content: newMessage.content,
              last_message_time: newMessage.timestamp,
              last_message_status: newMessage.status,
              last_message_sender_id: newMessage.sender_id,
              updated_at: newMessage.timestamp
            };
          }
          return room;
        });
      });

      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
};

export const useUpdateMessageStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: chatApi.updateMessageStatus,
    onSuccess: (_, _variables) => {
      // Update message status in all relevant caches
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
      queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
    },
  });
};

export const useUpdateOnlineStatus = () => {
  return useMutation({
    mutationFn: chatApi.updateOnlineStatus,
  });
};

export const useUserOnlineStatus = (userId: string) => {
  return useQuery({
    queryKey: ['userOnlineStatus', userId],
    queryFn: () => chatApi.getUserOnlineStatus(userId),
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

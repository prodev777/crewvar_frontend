import { useState } from "react";
import { IChatRoom } from "../features/chat/api/chatApi";

interface ChatListProps {
    chatRooms: IChatRoom[];
    onSelectChat: (room: IChatRoom) => void;
}

export const ChatList = ({ chatRooms, onSelectChat }: ChatListProps) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredRooms = chatRooms.filter(room => {
        if (!searchTerm) return true;
        return room.other_user_name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    const getMessageStatusIcon = (status?: string) => {
        switch (status) {
            case 'read':
                return <span className="text-white">✓✓</span>;
            case 'delivered':
                return <span className="text-white">✓✓</span>;
            case 'sent':
                return <span className="text-white">✓</span>;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                {filteredRooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <svg className="h-12 w-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-lg font-medium">No conversations found</p>
                        <p className="text-sm">Start a new conversation</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredRooms.map((room) => (
                            <div
                                key={room.room_id}
                                onClick={() => onSelectChat(room)}
                                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <img
                                            src={room.other_user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.other_user_name)}&background=4ECDC4&color=fff&size=128`}
                                            alt={room.other_user_name}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                        {room.unread_count > 0 && (
                                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                                {room.unread_count > 9 ? '9+' : room.unread_count}
                                            </div>
                                        )}
                                    </div>

                                    {/* Chat Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {room.other_user_name}
                                            </p>
                                            <div className="flex items-center space-x-1">
                                                <span className="text-xs text-gray-500">
                                                    {room.last_message_time ? formatTime(room.last_message_time) : formatTime(room.updated_at)}
                                                </span>
                                                {getMessageStatusIcon(room.last_message_status)}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate mt-1">
                                            {room.last_message_content || 'No messages yet'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChatRooms, useChatMessages } from "../../chat/api/chatApi";
import { useConnections } from "../../connections/api/connectionApi";
import { useAuth } from "../../../context/AuthContext";
import { ChatList } from "../../../components/ChatList";
import { ChatWindow } from "../../../components/ChatWindow";

interface ConnectedUser {
    id: string;
    name: string;
    avatar: string;
    role: string;
    department: string;
    ship: string;
    cruiseLine: string;
    isOnline: boolean;
}

interface ConnectedUsersListProps {
    users: ConnectedUser[];
    onSelectUser: (user: ConnectedUser) => void;
}

const ConnectedUsersList = ({ users, onSelectUser }: ConnectedUsersListProps) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 bg-white">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search connected users..."
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

            {/* Users List */}
            <div className="flex-1 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <svg className="h-12 w-12 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-lg font-medium">No connected users found</p>
                        <p className="text-sm">Try adjusting your search terms</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => onSelectUser(user)}
                                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                        {user.isOnline && (
                                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {user.name}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">
                                            {user.role}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">
                                            {user.department}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">
                                            {user.ship} • {user.cruiseLine}
                                        </p>
                                    </div>

                                    {/* Chat Icon */}
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
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

export const Chat = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; avatar: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'chats' | 'connections'>('chats');
    const [showChatWindow, setShowChatWindow] = useState(false);

    const { data: chatRooms, isLoading: roomsLoading } = useChatRooms();
    const { data: chatData, isLoading: messagesLoading } = useChatMessages(userId || '');
    const { data: connectionsData, isLoading: connectionsLoading } = useConnections();


    const getConnectedUsers = (): ConnectedUser[] => {
        if (!connectionsData?.connections) {
            return [];
        }
        
        return connectionsData.connections
            .map(conn => {
                const otherUserId = conn.user1_id === currentUser?.uid ? conn.user2_id : conn.user1_id;
                
                return {
                    id: otherUserId,
                    name: conn.display_name || `User ${otherUserId.slice(-4)}`,
                    avatar: conn.profile_photo || '/default-avatar.png',
                    role: conn.role_name || 'Crew Member',
                    department: conn.department_name || 'Not specified',
                    ship: conn.ship_name || 'Not specified',
                    cruiseLine: conn.cruise_line_name || 'Not specified',
                    isOnline: true
                };
            })
            .filter((user): user is ConnectedUser => user !== null);
    };

    const handleSelectChat = (room: any) => {
        // Use the room data directly since we have other_user_name and other_user_avatar
        if (room.other_user_name) {
            const selectedUserData = {
                id: room.other_user_id || room.room_id,
                name: room.other_user_name,
                avatar: room.other_user_avatar || '/default-avatar.png'
            };
            
            setSelectedUser(selectedUserData);
            setShowChatWindow(true);
            navigate(`/chat/${selectedUserData.id}`);
        } else {
            // Fallback: try to extract user info from room data
            const fallbackUser = {
                id: room.room_id || 'unknown',
                name: 'Unknown User',
                avatar: '/default-avatar.png'
            };
            setSelectedUser(fallbackUser);
            setShowChatWindow(true);
            navigate(`/chat/${fallbackUser.id}`);
        }
    };

    const handleSelectConnection = (user: ConnectedUser) => {
        setSelectedUser({
            id: user.id,
            name: user.name,
            avatar: user.avatar
        });
        setShowChatWindow(true);
        navigate(`/chat/${user.id}`);
    };

    const handleBackToList = () => {
        setShowChatWindow(false);
        setSelectedUser(null);
        navigate('/chat');
    };

    if (roomsLoading || connectionsLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading chat...</p>
                </div>
            </div>
        );
    }

    // Mobile Layout: Show chat window if user is selected
    if (showChatWindow && selectedUser) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                {/* Mobile Header */}
                <div className="bg-teal-600 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleBackToList}
                            className="p-2 hover:bg-teal-700 rounded-lg transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <img
                            src={selectedUser.avatar}
                            alt={selectedUser.name}
                            className="h-8 w-8 rounded-full object-cover"
                        />
                        <div>
                            <h1 className="font-medium">{selectedUser.name}</h1>
                            <p className="text-xs text-teal-100">online</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center space-x-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-xs font-medium">Dashboard</span>
                    </button>
                </div>

                {/* Chat Window */}
                <div className="flex-1">
                    <ChatWindow
                        chatUser={selectedUser}
                        onClose={handleBackToList}
                        messages={chatData?.messages || []}
                        isLoading={messagesLoading}
                    />
                </div>
            </div>
        );
    }

    // Mobile Layout: Show list view
    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Mobile Header */}
            <div className="bg-teal-600 text-white p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">Messages</h1>
                        <p className="text-sm text-teal-100">
                            {activeTab === 'chats' 
                                ? `${chatRooms?.length || 0} conversations`
                                : `${connectionsData?.connections?.length || 0} connected users`
                            }
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-sm font-medium">Dashboard</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white">
                <button
                    onClick={() => setActiveTab('chats')}
                    className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                        activeTab === 'chats'
                            ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <div className="flex items-center justify-center space-x-2">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Conversations</span>
                        {chatRooms && chatRooms.length > 0 && (
                            <span className="ml-2 bg-teal-100 text-teal-600 text-xs px-2 py-1 rounded-full">
                                {chatRooms.length}
                            </span>
                        )}
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('connections')}
                    className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                        activeTab === 'connections'
                            ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <div className="flex items-center justify-center space-x-2">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Connected</span>
                        {connectionsData && connectionsData.connections && (
                            <span className="ml-2 bg-teal-100 text-teal-600 text-xs px-2 py-1 rounded-full">
                                {connectionsData.connections.length}
                            </span>
                        )}
                    </div>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'chats' ? (
                    <ChatList chatRooms={chatRooms || []} onSelectChat={handleSelectChat} />
                ) : (
                    <ConnectedUsersList users={getConnectedUsers()} onSelectUser={handleSelectConnection} />
                )}
            </div>
        </div>
    );
};
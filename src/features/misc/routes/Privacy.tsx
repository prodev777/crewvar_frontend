import { useState } from "react";
import { PrivacySettings } from "../../../components/PrivacySettings";
import { BlockedUsersManager } from "../../../components/BlockedUsersManager";

export const Privacy = () => {
    const [activeTab, setActiveTab] = useState<'settings' | 'blocked'>('settings');

    return (
        <div className="container">
            <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#069B93] mb-2">Privacy & Security</h1>
                        <p className="text-gray-600">Manage your privacy settings and blocked users</p>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'settings'
                                            ? 'border-[#069B93] text-[#069B93]'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Privacy Settings
                                </button>
                                <button
                                    onClick={() => setActiveTab('blocked')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'blocked'
                                            ? 'border-[#069B93] text-[#069B93]'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Blocked Users
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="max-w-4xl mx-auto">
                        {activeTab === 'settings' && <PrivacySettings />}
                        {activeTab === 'blocked' && <BlockedUsersManager />}
                    </div>

                    {/* Privacy Information */}
                    <div className="mt-8 max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h2 className="text-lg font-semibold text-[#069B93] mb-4">Privacy Rules Explained</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">🔒 Verification Required</h3>
                                    <p className="text-sm text-gray-600">
                                        Only verified active profiles can see crew members and connect with others. 
                                        This ensures a safe environment for all users.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">📅 Today's Ship Only</h3>
                                    <p className="text-sm text-gray-600">
                                        Ship assignments are limited to today's information by default. 
                                        Future assignments are hidden unless explicitly allowed.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">🤫 Silent Declines</h3>
                                    <p className="text-sm text-gray-600">
                                        Declined connection requests are handled silently. 
                                        The sender won't be notified, maintaining privacy.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">🚫 Mutual Blocking</h3>
                                    <p className="text-sm text-gray-600">
                                        When you block someone, you become invisible to them too. 
                                        This enforces mutual invisibility for complete privacy.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

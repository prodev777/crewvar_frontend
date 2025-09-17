import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationsContext } from '../../../context/NotificationContext';

const NotificationSettings = () => {
    const navigate = useNavigate();
    const { 
        preferences, 
        isLoadingPreferences, 
        updatePreferences 
    } = useNotificationsContext();
    
    const [localPreferences, setLocalPreferences] = useState<Array<{
        type: string;
        emailEnabled: boolean;
        pushEnabled: boolean;
        inAppEnabled: boolean;
    }>>([]);
    
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // Initialize local preferences when context data loads
    useEffect(() => {
        if (preferences.length > 0) {
            const formattedPrefs = preferences.map(pref => ({
                type: pref.type,
                emailEnabled: pref.email_enabled,
                pushEnabled: pref.push_enabled,
                inAppEnabled: pref.in_app_enabled
            }));
            setLocalPreferences(formattedPrefs);
        } else {
            // Set default preferences if none exist
            const defaultPrefs = [
                { type: 'connection_request', emailEnabled: true, pushEnabled: true, inAppEnabled: true },
                { type: 'connection_accepted', emailEnabled: true, pushEnabled: true, inAppEnabled: true },
                { type: 'connection_declined', emailEnabled: false, pushEnabled: true, inAppEnabled: true },
                { type: 'message', emailEnabled: false, pushEnabled: true, inAppEnabled: true },
                { type: 'system', emailEnabled: true, pushEnabled: true, inAppEnabled: true },
                { type: 'assignment', emailEnabled: true, pushEnabled: true, inAppEnabled: true },
                { type: 'port_connection', emailEnabled: false, pushEnabled: true, inAppEnabled: true },
                { type: 'moderation', emailEnabled: true, pushEnabled: true, inAppEnabled: true }
            ];
            setLocalPreferences(defaultPrefs);
        }
    }, [preferences]);

    const handlePreferenceChange = (type: string, field: 'emailEnabled' | 'pushEnabled' | 'inAppEnabled', value: boolean) => {
        setLocalPreferences(prev => 
            prev.map(pref => 
                pref.type === type 
                    ? { ...pref, [field]: value }
                    : pref
            )
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('');
        
        try {
            await updatePreferences(localPreferences);
            setSaveMessage('Settings saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            setSaveMessage('Failed to save settings. Please try again.');
            setTimeout(() => setSaveMessage(''), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const getNotificationTypeLabel = (type: string) => {
        const labels: { [key: string]: string } = {
            'connection_request': 'Connection Requests',
            'connection_accepted': 'Connection Accepted',
            'connection_declined': 'Connection Declined',
            'message': 'Messages',
            'system': 'System Notifications',
            'assignment': 'Assignment Updates',
            'port_connection': 'Port Connections',
            'moderation': 'Moderation Alerts'
        };
        return labels[type] || type;
    };

    const getNotificationTypeDescription = (type: string) => {
        const descriptions: { [key: string]: string } = {
            'connection_request': 'When someone sends you a connection request',
            'connection_accepted': 'When someone accepts your connection request',
            'connection_declined': 'When someone declines your connection request',
            'message': 'When you receive new messages',
            'system': 'Important system updates and announcements',
            'assignment': 'Updates about your cruise assignments and schedule',
            'port_connection': 'Notifications about port connections and ship meetings',
            'moderation': 'Alerts about moderation actions and reports'
        };
        return descriptions[type] || '';
    };

    const getNotificationIcon = (type: string) => {
        const icons: { [key: string]: string } = {
            'connection_request': '👥',
            'connection_accepted': '✅',
            'connection_declined': '❌',
            'message': '💬',
            'system': '🔔',
            'assignment': '📅',
            'port_connection': '🚢',
            'moderation': '🛡️'
        };
        return icons[type] || '📢';
    };

    if (isLoadingPreferences) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-8">
                            <div className="animate-pulse">
                                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                                <div className="space-y-6">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Manage your notification preferences
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Save Message */}
                {saveMessage && (
                    <div className={`mb-6 p-4 rounded-lg border ${
                        saveMessage.includes('successfully') 
                            ? 'bg-green-50 text-green-800 border-green-200' 
                            : 'bg-red-50 text-red-800 border-red-200'
                    }`}>
                        <div className="flex items-center">
                            {saveMessage.includes('successfully') ? (
                                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                            <span className="font-medium">{saveMessage}</span>
                        </div>
                    </div>
                )}

                {/* Settings Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {localPreferences.map((pref) => (
                        <div key={pref.type} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <span className="text-xl">{getNotificationIcon(pref.type)}</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {getNotificationTypeLabel(pref.type)}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            {getNotificationTypeDescription(pref.type)}
                                        </p>
                                        
                                        <div className="space-y-3">
                                            {/* Email Notifications */}
                                            <div className="flex items-center justify-between py-2">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700">Email</span>
                                                        <p className="text-xs text-gray-500">Receive via email</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={pref.emailEnabled}
                                                        onChange={(e) => handlePreferenceChange(pref.type, 'emailEnabled', e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>

                                            {/* Push Notifications */}
                                            <div className="flex items-center justify-between py-2">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700">Push</span>
                                                        <p className="text-xs text-gray-500">Device notifications</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={pref.pushEnabled}
                                                        onChange={(e) => handlePreferenceChange(pref.type, 'pushEnabled', e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>

                                            {/* In-App Notifications */}
                                            <div className="flex items-center justify-between py-2">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-7a7 7 0 00-14 0v7h5l-5 5-5-5h5V7a7 7 0 1114 0v10z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700">In-App</span>
                                                        <p className="text-xs text-gray-500">Show in application</p>
                                                    </div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={pref.inAppEnabled}
                                                        onChange={(e) => handlePreferenceChange(pref.type, 'inAppEnabled', e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Save Button */}
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-sm hover:shadow-md"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Save Settings</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;
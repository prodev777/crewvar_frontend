// Moderation and Community Health Types for Crewvar

export interface IReport {
    id: string;
    reporterId: string;
    reportedUserId: string;
    reportType: 'spam' | 'harassment' | 'inappropriate_content' | 'fake_profile' | 'other';
    description: string;
    evidence?: string[]; // URLs to screenshots, messages, etc.
    status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    createdAt: string;
    updatedAt: string;
    reviewedBy?: string;
    resolution?: string;
    actions?: IModerationAction[];
}

export interface IModerationAction {
    id: string;
    reportId: string;
    actionType: 'warning' | 'temporary_ban' | 'permanent_ban' | 'content_removal' | 'profile_restriction' | 'no_action';
    targetUserId: string;
    reason: string;
    duration?: number; // hours for temporary bans
    createdAt: string;
    performedBy: string;
    isActive: boolean;
}

export interface ISuspiciousActivity {
    id: string;
    userId: string;
    activityType: 'rapid_requests' | 'spam_messages' | 'fake_profile_indicators' | 'suspicious_patterns';
    severity: 'low' | 'medium' | 'high';
    description: string;
    detectedAt: string;
    isResolved: boolean;
    autoActions?: string[];
}

export interface IModerationStats {
    totalReports: number;
    pendingReports: number;
    resolvedReports: number;
    activeBans: number;
    suspiciousUsers: number;
    reportsThisWeek: number;
    averageResolutionTime: number; // hours
}

export interface IModerationContext {
    reports: IReport[];
    moderationActions: IModerationAction[];
    suspiciousActivities: ISuspiciousActivity[];
    stats: IModerationStats;
    isAdmin: boolean;
    isLoading?: boolean;
    submitReport: (report: Omit<IReport, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<void>;
    updateReportStatus: (reportId: string, status: IReport['status'], resolution?: string) => Promise<void>;
    performModerationAction: (action: Omit<IModerationAction, 'id' | 'createdAt' | 'performedBy'>) => Promise<void>;
    getReportsForUser: (userId: string) => IReport[];
    getModerationActionsForUser: (userId: string) => IModerationAction[];
    getSuspiciousActivities: () => ISuspiciousActivity[];
    getModerationStats: () => IModerationStats;
    markSuspiciousActivityResolved: (activityId: string) => Promise<void>;
}

export interface IReportFormData {
    reportedUserId: string;
    reportType: IReport['reportType'];
    description: string;
    evidence?: string[];
}

export interface IModerationDashboard {
    recentReports: IReport[];
    suspiciousActivities: ISuspiciousActivity[];
    stats: IModerationStats;
    quickActions: {
        banUser: (userId: string, reason: string, duration?: number) => Promise<void>;
        warnUser: (userId: string, reason: string) => Promise<void>;
        removeContent: (contentId: string, reason: string) => Promise<void>;
    };
}

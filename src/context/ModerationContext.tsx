import { createContext, useContext, useState, ReactNode } from "react";
import { IReport, IModerationAction, ISuspiciousActivity, IModerationStats, IModerationContext } from "../types/moderation";
import {
    useReports,
    useSuspiciousActivities,
    useModerationStats,
    useUpdateReportStatus,
    usePerformModerationAction,
    useSubmitReport,
    IReport as APIReport,
    IModerationStats as APIModerationStats,
    ISuspiciousActivity as APISuspiciousActivity
} from "../features/moderation/api/moderationApi";

const ModerationContext = createContext<IModerationContext | undefined>(undefined);

export const useModeration = () => {
    const context = useContext(ModerationContext);
    if (context === undefined) {
        throw new Error('useModeration must be used within a ModerationProvider');
    }
    return context;
};

interface ModerationProviderProps {
    children: ReactNode;
}

export const ModerationProvider = ({ children }: ModerationProviderProps) => {
    const [moderationActions] = useState<IModerationAction[]>([]);
    const [isAdmin] = useState(true); // In real app, this would come from auth context

    // Use real API hooks
    const { data: reportsData, isLoading: reportsLoading } = useReports();
    const { data: suspiciousData, isLoading: suspiciousLoading } = useSuspiciousActivities();
    const { data: statsData, isLoading: statsLoading } = useModerationStats();
    
    const updateReportStatusMutation = useUpdateReportStatus();
    const performModerationActionMutation = usePerformModerationAction();
    const submitReportMutation = useSubmitReport();

    // Convert API types to context types
    const convertAPIReportToContext = (apiReport: APIReport): IReport => ({
        id: apiReport.id,
        reporterId: apiReport.reporterId,
        reportedUserId: apiReport.reportedUserId,
        reportType: apiReport.reportType,
        description: apiReport.description,
        status: apiReport.status === 'investigating' ? 'under_review' as any : apiReport.status === 'pending' ? 'pending' as any : apiReport.status === 'resolved' ? 'resolved' as any : 'dismissed' as any,
        resolution: apiReport.resolution,
        priority: 'medium', // Default priority
        createdAt: apiReport.createdAt,
        updatedAt: apiReport.updatedAt,
        reviewedBy: undefined,
        actions: []
    });

    const convertAPIStatsToContext = (apiStats: APIModerationStats): IModerationStats => ({
        totalReports: apiStats.totalReports,
        pendingReports: apiStats.pendingReports,
        resolvedReports: apiStats.resolvedReports,
        activeBans: apiStats.temporaryBans + apiStats.permanentBans,
        suspiciousUsers: 0, // Not available in API yet
        reportsThisWeek: 0, // Not available in API yet
        averageResolutionTime: 0 // Not available in API yet
    });

    const reports = (reportsData?.reports || []).map(convertAPIReportToContext);
    const suspiciousActivities = (suspiciousData?.activities || []).map((apiActivity: APISuspiciousActivity): ISuspiciousActivity => ({
        id: apiActivity.id,
        userId: apiActivity.userId,
        activityType: apiActivity.activityType as any,
        severity: apiActivity.severity,
        description: apiActivity.description,
        detectedAt: apiActivity.createdAt,
        isResolved: apiActivity.status === 'resolved',
        autoActions: []
    }));
    const stats = statsData?.stats ? convertAPIStatsToContext(statsData.stats) : {
        totalReports: 0,
        pendingReports: 0,
        resolvedReports: 0,
        activeBans: 0,
        suspiciousUsers: 0,
        reportsThisWeek: 0,
        averageResolutionTime: 0
    };

    const submitReport = async (reportData: Omit<IReport, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<void> => {
        try {
            await submitReportMutation.mutateAsync({
                reportedUserId: reportData.reportedUserId,
                reportType: reportData.reportType,
                description: reportData.description
            });
            
            console.log('Report submitted successfully');
        } catch (error) {
            console.error('Failed to submit report:', error);
            throw error;
        }
    };

    const updateReportStatus = async (reportId: string, status: IReport['status'], resolution?: string): Promise<void> => {
        try {
            await updateReportStatusMutation.mutateAsync({
                id: reportId,
                status: status as any,
                resolution
            });
            
            console.log('Report status updated');
        } catch (error) {
            console.error('Failed to update report status:', error);
            throw error;
        }
    };

    const performModerationAction = async (actionData: Omit<IModerationAction, 'id' | 'createdAt' | 'performedBy'>): Promise<void> => {
        try {
            await performModerationActionMutation.mutateAsync({
                reportId: actionData.reportId,
                actionType: actionData.actionType as any,
                targetUserId: actionData.targetUserId,
                reason: actionData.reason,
                isActive: actionData.isActive
            });
            
            console.log('Moderation action performed successfully');
        } catch (error) {
            console.error('Failed to perform moderation action:', error);
            throw error;
        }
    };

    const getReportsForUser = (userId: string): IReport[] => {
        return reports.filter(report => 
            report.reporterId === userId || report.reportedUserId === userId
        );
    };

    const getModerationActionsForUser = (userId: string): IModerationAction[] => {
        return moderationActions.filter(action => action.targetUserId === userId);
    };

    const getSuspiciousActivities = (): ISuspiciousActivity[] => {
        return suspiciousActivities.filter(activity => !activity.isResolved);
    };

    const getModerationStats = (): IModerationStats => {
        return stats;
    };

    const markSuspiciousActivityResolved = async (activityId: string): Promise<void> => {
        try {
            // For now, this would be a separate API endpoint
            // We'll implement this later if needed
            console.log('Suspicious activity marked as resolved:', activityId);
        } catch (error) {
            console.error('Failed to mark suspicious activity as resolved:', error);
            throw error;
        }
    };

    const value: IModerationContext = {
        reports,
        moderationActions,
        suspiciousActivities,
        stats,
        isAdmin,
        isLoading: reportsLoading || suspiciousLoading || statsLoading,
        submitReport,
        updateReportStatus,
        performModerationAction,
        getReportsForUser,
        getModerationActionsForUser,
        getSuspiciousActivities,
        getModerationStats,
        markSuspiciousActivityResolved
    };

    return (
        <ModerationContext.Provider value={value}>
            {children}
        </ModerationContext.Provider>
    );
};

import { createContext, useContext, useState, ReactNode } from "react";
import { ICruiseAssignment, ICalendarEvent, ICalendarView, ICalendarContext, ICreateAssignmentData } from "../types/calendar";
import {
    useCruiseAssignments,
    useCalendarEvents,
    useCreateCruiseAssignment,
    useUpdateCruiseAssignment,
    useDeleteCruiseAssignment,
    IAssignmentResponse,
    IEventResponse
} from "../features/calendar/api/calendarApi";

const CalendarContext = createContext<ICalendarContext | undefined>(undefined);

export const useCalendar = () => {
    const context = useContext(CalendarContext);
    if (context === undefined) {
        throw new Error('useCalendar must be used within a CalendarProvider');
    }
    return context;
};

// Conversion functions to map API response types to frontend context types
const convertAPIAssignmentToContext = (apiAssignment: IAssignmentResponse['assignment']): ICruiseAssignment => {
    return {
        id: apiAssignment.id,
        userId: apiAssignment.user_id,
        cruiseLineId: apiAssignment.cruise_line_id,
        shipId: apiAssignment.ship_id,
        startDate: apiAssignment.start_date,
        endDate: apiAssignment.end_date,
        status: apiAssignment.status,
        createdAt: apiAssignment.created_at,
        updatedAt: apiAssignment.updated_at
    };
};

const convertAPIEventToContext = (apiEvent: IEventResponse['event']): ICalendarEvent => {
    return {
        id: apiEvent.id,
        title: apiEvent.title,
        start: apiEvent.start_date,
        end: apiEvent.end_date,
        type: apiEvent.event_type,
        assignmentId: apiEvent.assignment_id || undefined,
        description: apiEvent.description || undefined,
        color: apiEvent.color || undefined
    };
};

interface CalendarProviderProps {
    children: ReactNode;
}

export const CalendarProvider = ({ children }: CalendarProviderProps) => {
    const [currentView, setCurrentView] = useState<ICalendarView>({
        view: 'month',
        currentDate: new Date().toISOString().split('T')[0]
    });

    // API hooks
    const { data: assignmentsData, isLoading: assignmentsLoading } = useCruiseAssignments();
    const { data: eventsData, isLoading: eventsLoading } = useCalendarEvents();
    
    const createAssignmentMutation = useCreateCruiseAssignment();
    const updateAssignmentMutation = useUpdateCruiseAssignment();
    const deleteAssignmentMutation = useDeleteCruiseAssignment();
    // const createEventMutation = useCreateCalendarEvent(); // TODO: Implement event creation

    // Convert API data to context format
    const assignments: ICruiseAssignment[] = assignmentsData?.assignments?.map(convertAPIAssignmentToContext) || [];
    const events: ICalendarEvent[] = eventsData?.events?.map(convertAPIEventToContext) || [];

    const addAssignmentHandler = async (assignmentData: ICreateAssignmentData): Promise<void> => {
        try {
            await createAssignmentMutation.mutateAsync({
                cruiseLineId: assignmentData.cruiseLineId,
                shipId: assignmentData.shipId,
                startDate: assignmentData.startDate,
                endDate: assignmentData.endDate,
                status: assignmentData.status
            });
            
            console.log('Assignment added successfully');
        } catch (error) {
            console.error('Failed to add assignment:', error);
            throw error;
        }
    };

    const updateAssignmentHandler = async (assignmentId: string, updates: Partial<ICruiseAssignment>): Promise<void> => {
        try {
            const updateData: any = {};
            if (updates.cruiseLineId) updateData.cruiseLineId = updates.cruiseLineId;
            if (updates.shipId) updateData.shipId = updates.shipId;
            if (updates.startDate) updateData.startDate = updates.startDate;
            if (updates.endDate) updateData.endDate = updates.endDate;
            if (updates.status) updateData.status = updates.status;

            await updateAssignmentMutation.mutateAsync({
                assignmentId,
                updates: updateData
            });
            
            console.log('Assignment updated successfully');
        } catch (error) {
            console.error('Failed to update assignment:', error);
            throw error;
        }
    };

    const deleteAssignmentHandler = async (assignmentId: string): Promise<void> => {
        try {
            await deleteAssignmentMutation.mutateAsync(assignmentId);
            
            console.log('Assignment deleted successfully');
        } catch (error) {
            console.error('Failed to delete assignment:', error);
            throw error;
        }
    };

    const getAssignmentsForDateRangeHandler = (startDate: string, endDate: string): ICruiseAssignment[] => {
        return assignments.filter(assignment => {
            const assignmentStart = new Date(assignment.startDate);
            const assignmentEnd = new Date(assignment.endDate);
            const rangeStart = new Date(startDate);
            const rangeEnd = new Date(endDate);
            
            return assignmentStart <= rangeEnd && assignmentEnd >= rangeStart;
        });
    };

    const getEventsForDateRangeHandler = (startDate: string, endDate: string): ICalendarEvent[] => {
        return events.filter(event => {
            const eventDate = new Date(event.start);
            const rangeStart = new Date(startDate);
            const rangeEnd = new Date(endDate);
            
            return eventDate >= rangeStart && eventDate <= rangeEnd;
        });
    };

    const setCurrentViewHandler = (view: ICalendarView) => {
        setCurrentView(view);
    };

    const isLoading = assignmentsLoading || eventsLoading || 
                     createAssignmentMutation.isLoading || 
                     updateAssignmentMutation.isLoading || 
                     deleteAssignmentMutation.isLoading;

    const value: ICalendarContext = {
        assignments,
        events,
        currentView,
        isLoading,
        addAssignment: addAssignmentHandler,
        updateAssignment: updateAssignmentHandler,
        deleteAssignment: deleteAssignmentHandler,
        getAssignmentsForDateRange: getAssignmentsForDateRangeHandler,
        getEventsForDateRange: getEventsForDateRangeHandler,
        setCurrentView: setCurrentViewHandler
    };

    return (
        <CalendarContext.Provider value={value}>
            {children}
        </CalendarContext.Provider>
    );
};

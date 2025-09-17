import { useCalendar } from "../context/CalendarContext";
import { ICruiseAssignment } from "../types/calendar";
import { sampleCruiseLines } from "../data/onboarding-data";
import { formatDateRange, getDaysDifference } from "../data/calendar-data";

interface CalendarViewProps {
    onAddAssignment?: () => void;
    onEditAssignment?: (assignment: ICruiseAssignment) => void;
    className?: string;
}

export const CalendarView = ({ 
    onAddAssignment, 
    onEditAssignment,
    className = ""
}: CalendarViewProps) => {
    const { assignments, currentView } = useCalendar();

    // Get assignments for the current month
    const getAssignmentsForMonth = () => {
        const currentDate = new Date(currentView.currentDate);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);
        
        return assignments.filter(assignment => {
            const assignmentStart = new Date(assignment.startDate);
            const assignmentEnd = new Date(assignment.endDate);
            
            return assignmentStart <= endOfMonth && assignmentEnd >= startOfMonth;
        });
    };

    const getAssignmentsForDate = (date: string) => {
        return assignments.filter(assignment => {
            const assignmentStart = new Date(assignment.startDate);
            const assignmentEnd = new Date(assignment.endDate);
            const checkDate = new Date(date);
            
            return checkDate >= assignmentStart && checkDate <= assignmentEnd;
        });
    };

    const getStatusColor = (status: ICruiseAssignment['status']) => {
        switch (status) {
            case 'current': return 'bg-green-100 text-green-800 border-green-200';
            case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getShipName = (assignment: ICruiseAssignment) => {
        const cruiseLine = sampleCruiseLines.find(cl => cl.id === assignment.cruiseLineId);
        const ship = cruiseLine?.ships.find(s => s.id === assignment.shipId);
        return ship?.name || 'Unknown Ship';
    };

    const getCruiseLineName = (assignment: ICruiseAssignment) => {
        const cruiseLine = sampleCruiseLines.find(cl => cl.id === assignment.cruiseLineId);
        return cruiseLine?.name || 'Unknown Cruise Line';
    };

    // Generate calendar days for current month
    const generateCalendarDays = () => {
        const currentDate = new Date(currentView.currentDate);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
        
        const days = [];
        const currentDay = new Date(startDate);
        
        for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
            const dateString = currentDay.toISOString().split('T')[0];
            const isCurrentMonth = currentDay.getMonth() === month;
            const isToday = dateString === new Date().toISOString().split('T')[0];
            const dayAssignments = getAssignmentsForDate(dateString);
            
            days.push({
                date: dateString,
                day: currentDay.getDate(),
                isCurrentMonth,
                isToday,
                assignments: dayAssignments
            });
            
            currentDay.setDate(currentDay.getDate() + 1);
        }
        
        return days;
    };

    const calendarDays = generateCalendarDays();
    const monthAssignments = getAssignmentsForMonth();

    return (
        <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
            {/* Calendar Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-[#069B93]">My Cruise Schedule</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage your cruise assignments and see your schedule
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onAddAssignment}
                        className="px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium"
                    >
                        + Add Assignment
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {new Date(currentView.currentDate).toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                        })}
                    </h3>
                    <div className="flex space-x-2">
                        <button type="button" className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">
                            ←
                        </button>
                        <button type="button" className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">
                            →
                        </button>
                    </div>
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => (
                        <div
                            key={index}
                            className={`min-h-[100px] p-2 border border-gray-200 ${
                                day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                            } ${day.isToday ? 'ring-2 ring-[#069B93]' : ''}`}
                        >
                            <div className={`text-sm font-medium mb-1 ${
                                day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                            } ${day.isToday ? 'text-[#069B93]' : ''}`}>
                                {day.day}
                            </div>
                            
                            <div className="space-y-1">
                                {day.assignments.slice(0, 2).map(assignment => (
                                    <div
                                        key={assignment.id}
                                        onClick={() => onEditAssignment?.(assignment)}
                                        className={`text-xs p-1 rounded border cursor-pointer hover:opacity-80 ${getStatusColor(assignment.status)}`}
                                        title={`${getShipName(assignment)} - ${formatDateRange(assignment.startDate, assignment.endDate)}`}
                                    >
                                        <div className="truncate font-medium">
                                            {getShipName(assignment)}
                                        </div>
                                        <div className="truncate opacity-75">
                                            {getCruiseLineName(assignment)}
                                        </div>
                                    </div>
                                ))}
                                {day.assignments.length > 2 && (
                                    <div className="text-xs text-gray-500 text-center">
                                        +{day.assignments.length - 2} more
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Assignments Summary */}
            {monthAssignments.length > 0 && (
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-3">This Month's Assignments</h4>
                    <div className="space-y-2">
                        {monthAssignments.map(assignment => (
                            <div
                                key={assignment.id}
                                className="flex items-center justify-between p-3 bg-white rounded-lg border"
                            >
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                        {getShipName(assignment)}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {getCruiseLineName(assignment)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {formatDateRange(assignment.startDate, assignment.endDate)} 
                                        ({getDaysDifference(assignment.startDate, assignment.endDate)} days)
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(assignment.status)}`}>
                                        {assignment.status}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onEditAssignment?.(assignment)}
                                        className="text-[#069B93] hover:text-[#058a7a] text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

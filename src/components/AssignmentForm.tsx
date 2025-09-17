import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCalendar } from "../context/CalendarContext";
import { ShipSelection } from "./ShipSelection";
import { IAssignmentFormData } from "../types/calendar";

interface AssignmentFormProps {
    onClose: () => void;
    onSuccess?: () => void;
    initialDate?: string;
    className?: string;
}

const assignmentValidationSchema = yup.object({
    cruiseLineId: yup.string().required("Cruise line is required"),
    shipId: yup.string().required("Ship is required"),
    startDate: yup.string().required("Start date is required"),
    endDate: yup.string().required("End date is required"),
    description: yup.string().optional()
}) as yup.ObjectSchema<IAssignmentFormData>;

export const AssignmentForm = ({ 
    onClose, 
    onSuccess,
    initialDate,
    className = ""
}: AssignmentFormProps) => {
    const { addAssignment } = useCalendar();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCruiseLineId, setSelectedCruiseLineId] = useState<string>("");

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<IAssignmentFormData>({
        resolver: yupResolver(assignmentValidationSchema),
        defaultValues: {
            startDate: initialDate || new Date().toISOString().split('T')[0],
            endDate: initialDate || new Date().toISOString().split('T')[0]
        }
    });

    const watchedStartDate = watch("startDate");
    const watchedEndDate = watch("endDate");

    // Update end date when start date changes (minimum 1 day duration)
    useEffect(() => {
        if (watchedStartDate && watchedEndDate) {
            const startDate = new Date(watchedStartDate);
            const endDate = new Date(watchedEndDate);
            
            if (endDate <= startDate) {
                const newEndDate = new Date(startDate);
                newEndDate.setDate(newEndDate.getDate() + 1);
                setValue("endDate", newEndDate.toISOString().split('T')[0]);
            }
        }
    }, [watchedStartDate, watchedEndDate, setValue]);

    const onSubmit = async (data: IAssignmentFormData) => {
        setIsSubmitting(true);
        
        try {
            await addAssignment({
                cruiseLineId: data.cruiseLineId,
                shipId: data.shipId,
                startDate: data.startDate,
                endDate: data.endDate,
                status: 'upcoming'
            });
            
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Failed to add assignment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getMinEndDate = () => {
        if (watchedStartDate) {
            const startDate = new Date(watchedStartDate);
            startDate.setDate(startDate.getDate() + 1);
            return startDate.toISOString().split('T')[0];
        }
        return new Date().toISOString().split('T')[0];
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#069B93]">Add Cruise Assignment</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                    ×
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Ship Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Ship Assignment
                    </label>
                    <ShipSelection
                        selectedCruiseLineId={selectedCruiseLineId}
                        selectedShipId={watch("shipId")}
                        onCruiseLineChange={(cruiseLineId) => {
                            setSelectedCruiseLineId(cruiseLineId);
                            setValue("cruiseLineId", cruiseLineId);
                            setValue("shipId", "");
                        }}
                        onShipChange={(shipId) => setValue("shipId", shipId)}
                        placeholder="Select ship for this assignment"
                    />
                    {errors.cruiseLineId && (
                        <p className="text-red-500 text-sm mt-1">{errors.cruiseLineId.message}</p>
                    )}
                    {errors.shipId && (
                        <p className="text-red-500 text-sm mt-1">{errors.shipId.message}</p>
                    )}
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                        </label>
                        <input
                            {...register("startDate")}
                            type="date"
                            id="startDate"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                        />
                        {errors.startDate && (
                            <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                        </label>
                        <input
                            {...register("endDate")}
                            type="date"
                            id="endDate"
                            min={getMinEndDate()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                        />
                        {errors.endDate && (
                            <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
                        )}
                    </div>
                </div>

                {/* Duration Display */}
                {watchedStartDate && watchedEndDate && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-blue-800">
                                Duration: {Math.ceil((new Date(watchedEndDate).getTime() - new Date(watchedStartDate).getTime()) / (1000 * 60 * 60 * 24))} days
                            </span>
                        </div>
                    </div>
                )}

                {/* Description (Optional) */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                    </label>
                    <textarea
                        {...register("description")}
                        id="description"
                        rows={3}
                        placeholder="Add any notes about this assignment..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none resize-none"
                    />
                </div>

                {/* Privacy Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs">ℹ</span>
                        </div>
                        <div>
                            <h4 className="font-medium text-green-900">Schedule Privacy</h4>
                            <p className="text-sm text-green-700 mt-1">
                                Your cruise assignments help us suggest connections when you're on the same ship or in the same port. 
                                Only your current assignment is visible to others.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 text-white bg-[#069B93] hover:bg-[#058a7a] rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? 'Adding Assignment...' : 'Add Assignment'}
                    </button>
                </div>
            </form>
        </div>
    );
};

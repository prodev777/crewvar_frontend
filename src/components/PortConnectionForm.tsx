import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { usePortConnection } from "../context/PortConnectionContext";
import { useAuth } from "../context/AuthContext";
import { useQuickCheckIn } from "../context/QuickCheckInContext";
import { useCruiseLines, useShipsByCruiseLine } from "../features/cruise/api/cruiseData";
import { IPortConnectionFormData } from "../types/port-connections";

interface PortConnectionFormProps {
    onClose: () => void;
    onSuccess?: () => void;
}

const portConnectionValidationSchema = yup.object({
    cruiseLineId: yup.string().required("Cruise line is required"),
    dockedWithShipId: yup.string().required("Ship is required"),
    date: yup.string().required("Date is required")
}) as yup.ObjectSchema<IPortConnectionFormData>;

export const PortConnectionForm = ({ onClose, onSuccess }: PortConnectionFormProps) => {
    const { currentUser } = useAuth();
    const { currentShip } = useQuickCheckIn();
    const { addPortConnection } = usePortConnection();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCruiseLineId, setSelectedCruiseLineId] = useState<string>("");

    const { data: cruiseLines = [], isLoading: cruiseLinesLoading } = useCruiseLines();
    const { data: availableShips = [], isLoading: shipsLoading } = useShipsByCruiseLine(selectedCruiseLineId);

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<IPortConnectionFormData>({
        resolver: yupResolver(portConnectionValidationSchema),
        defaultValues: {
            cruiseLineId: "",
            dockedWithShipId: "",
            date: new Date().toISOString().split('T')[0] // Today's date
        }
    });

    const watchedCruiseLineId = watch("cruiseLineId");
    const watchedDate = watch("date");

    // Update selected cruise line and reset ship selection when cruise line changes
    useEffect(() => {
        if (watchedCruiseLineId) {
            setSelectedCruiseLineId(watchedCruiseLineId);
            setValue("dockedWithShipId", ""); // Reset ship selection
        }
    }, [watchedCruiseLineId, setValue]);

    const onSubmit = async (data: IPortConnectionFormData) => {
        if (!currentUser || !currentShip) {
            console.error('User or ship information missing');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const selectedShip = availableShips.find(ship => ship.id === data.dockedWithShipId);
            if (!selectedShip) {
                console.error('Selected ship not found');
                return;
            }

            const connectionData = {
                userId: currentUser.uid,
                userDisplayName: currentUser.displayName || currentUser.email || 'Unknown User',
                userRole: "Crew Member", // This could be enhanced to get actual role
                shipId: currentShip.shipId,
                shipName: currentShip.shipName,
                portName: "Current Port", // Using generic port since we're connecting by cruise line
                dockedWithShipId: data.dockedWithShipId,
                dockedWithShipName: selectedShip.name,
                date: data.date
            };

            await addPortConnection(connectionData);
            
            if (onSuccess) {
                onSuccess();
            }
            onClose();
            
        } catch (error) {
            console.error('Failed to add port connection:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Current Ship Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="font-semibold text-blue-900">Your Ship</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                {currentShip ? currentShip.shipName : 'No ship selected'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Cruise Line Selection */}
                <div>
                    <label htmlFor="cruiseLineId" className="block text-sm font-semibold text-gray-800 mb-3">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-[#069B93]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>Cruise Line</span>
                        </div>
                    </label>
                    <select
                        {...register("cruiseLineId")}
                        id="cruiseLineId"
                        disabled={cruiseLinesLoading}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#069B93] focus:ring-2 focus:ring-[#069B93]/20 focus:outline-none transition-all duration-200 disabled:bg-gray-100 disabled:border-gray-200"
                    >
                        <option value="">{cruiseLinesLoading ? 'Loading cruise lines...' : 'Select cruise line'}</option>
                        {cruiseLines.map(cruiseLine => (
                            <option key={cruiseLine.id} value={cruiseLine.id}>
                                {cruiseLine.name}
                            </option>
                        ))}
                    </select>
                    {errors.cruiseLineId && (
                        <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{errors.cruiseLineId.message}</span>
                        </p>
                    )}
                </div>

                {/* Date Selection */}
                <div>
                    <label htmlFor="date" className="block text-sm font-semibold text-gray-800 mb-3">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-[#069B93]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span>Date</span>
                        </div>
                    </label>
                    <input
                        {...register("date")}
                        type="date"
                        id="date"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#069B93] focus:ring-2 focus:ring-[#069B93]/20 focus:outline-none transition-all duration-200"
                    />
                    {errors.date && (
                        <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{errors.date.message}</span>
                        </p>
                    )}
                </div>

                {/* Ship Selection */}
                <div>
                    <label htmlFor="dockedWithShipId" className="block text-sm font-semibold text-gray-800 mb-3">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-[#069B93]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>Docked with Ship</span>
                        </div>
                    </label>
                    <select
                        {...register("dockedWithShipId")}
                        id="dockedWithShipId"
                        disabled={!watchedCruiseLineId || !watchedDate || availableShips.length === 0 || shipsLoading}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#069B93] focus:ring-2 focus:ring-[#069B93]/20 focus:outline-none disabled:bg-gray-100 disabled:border-gray-200 transition-all duration-200"
                    >
                        <option value="">
                            {shipsLoading ? 'Loading ships...' : 
                             !watchedCruiseLineId || !watchedDate ? 'Select cruise line and date first' : 
                             availableShips.length === 0 ? 'No ships available' : 'Select ship'}
                        </option>
                        {availableShips.map(ship => (
                            <option key={ship.id} value={ship.id}>
                                {ship.name} {ship.cruise_line_name && `(${ship.cruise_line_name})`}
                            </option>
                        ))}
                    </select>
                    {errors.dockedWithShipId && (
                        <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{errors.dockedWithShipId.message}</span>
                        </p>
                    )}
                    {watchedCruiseLineId && watchedDate && availableShips.length === 0 && !shipsLoading && (
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-yellow-800 text-sm font-medium">No ships available for this cruise line.</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Box */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="font-semibold text-green-900">Port Connection Benefits</h4>
                            <p className="text-sm text-green-700 mt-1 leading-relaxed">
                                By marking your port status, you'll be able to see and connect with crew members 
                                from other ships docked in the same port today. Expand your maritime network!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 text-gray-600 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !watchedCruiseLineId || !watchedDate || availableShips.length === 0}
                        className="flex-1 px-6 py-3 text-white bg-gradient-to-r from-[#069B93] to-[#00A59E] hover:from-[#058a7a] hover:to-[#069B93] rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Marking Port...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Mark Cruise Line</span>
                            </div>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

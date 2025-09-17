import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useUpdateUserProfile, useUserProfile } from "../features/auth/api/userProfile";
import { useAllShips } from "../features/cruise/api/cruiseData";
import { Spinner } from "./Elements/Spinner";
import { sampleDepartments, sampleRoles } from "../data/onboarding-data";
import { ShipSelection } from "./ShipSelection";
import { defaultAvatar } from "../utils/images";
import { AssignmentForm } from "./AssignmentForm";
import { CalendarView } from "./CalendarView";
import { MissingShipFeedback } from "./MissingShipFeedback";
import { ISubcategory, IRole, ISuggestedProfile } from "../types/onboarding";

// Dynamic validation schema based on whether user has existing profile
const createValidationSchema = (hasExistingProfile: boolean) => yup.object({
    displayName: yup.string()
        .required("Display name is required")
        .min(2, "Display name must be at least 2 characters")
        .max(50, "Display name must be less than 50 characters"),
    profilePhoto: hasExistingProfile 
        ? yup.mixed().optional() // Optional if user already has a photo
        : yup.mixed().required("Profile photo is required"), // Required for new users
    departmentId: yup.string().required("Department is required"),
    subcategoryId: yup.string().required("Subcategory is required"),
    roleId: yup.string().required("Role is required"),
    currentShipId: yup.string().required("Current ship is required"),
    contractCalendar: yup.mixed().nullable().optional(),
});

// Removed unused compressImage function - using handleCustomSubmit instead

const OnboardingForm = () => {
    const navigate = useNavigate();
    const { data: userProfile, isLoading: profileLoading, error: profileError } = useUserProfile();
    const { data: allShips = [] } = useAllShips();
    const { mutateAsync: updateProfile } = useUpdateUserProfile();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [preview, setPreview] = useState<string | ArrayBuffer | null>(null);
    const [subcategories, setSubcategories] = useState<ISubcategory[]>([]);
    const [roles, setRoles] = useState<IRole[]>([]);
    const [suggestedProfiles] = useState<ISuggestedProfile[]>([]);
    const [onboardingComplete] = useState(false);
    const [selectedCruiseLineId, setSelectedCruiseLineId] = useState<string>("");
    const [showCalendar, setShowCalendar] = useState(false);
    const [showAssignmentForm, setShowAssignmentForm] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const { formState: { errors }, watch, setValue, reset, clearErrors } = useForm({
        resolver: userProfile && (userProfile.display_name || userProfile.profile_photo) 
            ? undefined // No validation for existing profiles
            : yupResolver(createValidationSchema(false)), // Only validate for new profiles
        defaultValues: {
            displayName: '',
            departmentId: '',
            subcategoryId: '',
            roleId: '',
            currentShipId: ''
        },
        mode: 'onSubmit' // Only validate on submit, not on change
    });

    // Memoized callback functions to prevent infinite re-renders
    const handleCruiseLineChange = useCallback((cruiseLineId: string) => {
        setSelectedCruiseLineId(cruiseLineId);
        setValue("currentShipId", ""); // Reset ship when cruise line changes
    }, [setValue]);

    const handleShipChange = useCallback((shipId: string) => {
        setValue("currentShipId", shipId);
    }, [setValue]);

    const watchedDepartmentId = watch("departmentId");
    const watchedSubcategoryId = watch("subcategoryId");

    // Load existing user data when profile is loaded
    useEffect(() => {
        if (userProfile) {
            console.log('Loading existing user data:', userProfile);
            
            // Pre-populate form with existing data
            const formData = {
                displayName: userProfile.display_name || '',
                departmentId: userProfile.department_id || '',
                subcategoryId: userProfile.subcategory_id || '',
                roleId: userProfile.role_id || '',
                currentShipId: userProfile.current_ship_id || ''
            };
            
            console.log('Setting form data:', formData);
            
            // Set form values directly
            reset(formData);
            
            // Also set individual values to ensure they're registered
            setValue("displayName", userProfile.display_name || '');
            setValue("departmentId", userProfile.department_id || '');
            setValue("subcategoryId", userProfile.subcategory_id || '');
            setValue("roleId", userProfile.role_id || '');
            setValue("currentShipId", userProfile.current_ship_id || '');
            
            console.log('Form values set:', {
                displayName: watch("displayName"),
                departmentId: watch("departmentId"),
                subcategoryId: watch("subcategoryId"),
                roleId: watch("roleId"),
                currentShipId: watch("currentShipId")
            });
            
            // Clear any existing validation errors
            clearErrors();
            
            // Force clear validation errors after a short delay to ensure form is updated
            setTimeout(() => {
                clearErrors();
            }, 100);

            // Set profile photo preview if exists
            if (userProfile.profile_photo) {
                setPreview(userProfile.profile_photo);
            }

            // Set cruise line based on ship selection
            if (userProfile.current_ship_id) {
                const ship = allShips.find(s => s.id === userProfile.current_ship_id);
                if (ship) {
                    setSelectedCruiseLineId(ship.cruise_line_id);
                }
            }

            // Load subcategories and roles based on existing data
            if (userProfile.department_id) {
                const department = sampleDepartments.find(d => d.id === userProfile.department_id);
                if (department) {
                    setSubcategories(department.subcategories || []);
                    
                    // Load roles if subcategory is also set
                    if (userProfile.subcategory_id) {
                        const filteredRoles = sampleRoles.filter(role => 
                            role.subcategoryId === userProfile.subcategory_id
                        );
                        setRoles(filteredRoles);
                    }
                }
            }
        }
    }, [userProfile, reset, setValue, clearErrors, allShips]);

    // Update subcategories when department changes
    useEffect(() => {
        if (watchedDepartmentId) {
            const department = sampleDepartments.find(d => d.id === watchedDepartmentId);
            setSubcategories(department?.subcategories || []);
            setValue("subcategoryId", "");
            setValue("roleId", "");
            setRoles([]);
        }
    }, [watchedDepartmentId, setValue]);

    // Update roles when subcategory changes
    useEffect(() => {
        if (watchedSubcategoryId) {
            console.log('Loading roles for subcategory:', watchedSubcategoryId);
            const filteredRoles = sampleRoles.filter(r => r.subcategoryId === watchedSubcategoryId);
            console.log('Filtered roles:', filteredRoles);
            setRoles(filteredRoles);
            setValue("roleId", "");
        }
    }, [watchedSubcategoryId, setValue]);

    // Custom submit handler that bypasses validation for existing profiles
    const handleCustomSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setIsSubmitting(true);
            
            // Get current form values
            const formData = {
                displayName: watch("displayName") || userProfile?.display_name || '',
                departmentId: watch("departmentId") || userProfile?.department_id || '',
                subcategoryId: watch("subcategoryId") || userProfile?.subcategory_id || '',
                roleId: watch("roleId") || userProfile?.role_id || '',
                currentShipId: watch("currentShipId") || userProfile?.current_ship_id || ''
            };
            
            console.log('Custom submit - Form data:', formData);
            
            // Check if all required fields have values
            if (!formData.displayName || !formData.departmentId || !formData.subcategoryId || !formData.roleId || !formData.currentShipId) {
                console.error('Missing required fields:', formData);
                alert('Please fill in all required fields');
                setIsSubmitting(false);
                return;
            }
            
            // Handle profile photo
            let profilePhotoBase64 = '';
            if (preview && typeof preview === 'string') {
                profilePhotoBase64 = preview;
            } else if (userProfile?.profile_photo) {
                profilePhotoBase64 = userProfile.profile_photo;
            }
            
            const updateData = {
                displayName: formData.displayName,
                profilePhoto: profilePhotoBase64,
                departmentId: formData.departmentId,
                subcategoryId: formData.subcategoryId,
                roleId: formData.roleId,
                currentShipId: formData.currentShipId
            };
            
            console.log('Sending update data to backend:', updateData);
            
            // Send profile data to backend
            try {
                await updateProfile(updateData);
                
                // Wait a moment for the profile to be updated in the backend
                // This prevents race conditions with OnboardingGuard
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error: any) {
                if (error.response?.status === 413) {
                    alert('Profile photo is too large. Please choose a smaller image.');
                } else {
                    alert('Failed to update profile. Please try again.');
                }
                setIsSubmitting(false);
                return;
            }
            
            // Profile update successful - redirect to dashboard
            // The OnboardingGuard will now see the updated profile and allow navigation
            navigate('/dashboard', { replace: true });
            
        } catch (error) {
            alert("Failed to save your profile. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading state while profile is being loaded
    if (profileLoading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#069B93] rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-[#069B93] font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    // Show error state if profile loading failed
    if (profileError) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl">⚠</span>
                    </div>
                    <p className="text-red-600 font-medium">Failed to load your profile</p>
                    <p className="text-gray-600 text-sm mt-2">Please try refreshing the page</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a]"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {isSubmitting && <Spinner />}
            
            <form onSubmit={handleCustomSubmit} className="space-y-8">
                {/* Profile Photo and Display Name Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-bold text-[#069B93] mb-4">
                        {userProfile && (userProfile.display_name || userProfile.profile_photo) 
                            ? 'Update Your Profile' 
                            : 'Profile Setup'
                        }
                    </h2>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="mx-auto md:mx-0">
                            <div className="shrink-0 w-36 h-36 sm:w-52 sm:h-52">
                                {!(preview || userProfile?.profile_photo) ? (
                                    <>
                                        <label className="rounded-full cursor-pointer w-full h-full flex items-center flex-col justify-center px-4 py-3 border-gray-200 border focus:border-[#069B93] focus:outline-none text-sm hover:bg-gray-100 transition-colors">
                                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <span className="text-sm text-gray-500 mt-2">Add Photo</span>
                                            <p className="text-red-500 font-semibold mt-2">{errors.profilePhoto?.message}</p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden focus:outline-none"
                                                onChange={(e) => {
                                                    if (e.target.files) {
                                                        const file = e.target.files[0];
                                                        setValue("profilePhoto", file);
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setPreview(reader.result);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </>
                                ) : (
                                    <img
                                        className="h-full w-full cursor-pointer object-cover rounded-[50%]"
                                        src={(preview as string) || userProfile?.profile_photo || defaultAvatar}
                                        onClick={() => {
                                            setPreview(null);
                                            setValue("profilePhoto", "");
                                        }}
                                        alt="Profile preview"
                                        onError={(e) => {
                                            console.error('Image failed to load:', e);
                                            console.log('Image src:', (e.target as HTMLImageElement).src);
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                        
                        <div className="flex-1">
                            <div>
                                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    id="displayName"
                                    placeholder="How should others see you?"
                                    value={watch("displayName") || userProfile?.display_name || ''}
                                    onChange={(e) => setValue("displayName", e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                                />
                                {errors.displayName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Department & Role Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-bold text-[#069B93] mb-4">Department & Role</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-1">
                                Department
                            </label>
                            <select
                                id="departmentId"
                                value={watch("departmentId") || userProfile?.department_id || ''}
                                onChange={(e) => setValue("departmentId", e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                            >
                                <option value="">Select your department</option>
                                {sampleDepartments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                            {errors.departmentId && (
                                <p className="text-red-500 text-sm mt-1">{errors.departmentId.message}</p>
                            )}
                        </div>

                        {watchedDepartmentId && subcategories.length > 0 && (
                            <div>
                                <label htmlFor="subcategoryId" className="block text-sm font-medium text-gray-700 mb-1">
                                    Subcategory
                                </label>
                                <select
                                    id="subcategoryId"
                                    value={watch("subcategoryId") || userProfile?.subcategory_id || ''}
                                    onChange={(e) => setValue("subcategoryId", e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                                >
                                    <option value="">Select subcategory</option>
                                    {subcategories.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.subcategoryId && (
                                    <p className="text-red-500 text-sm mt-1">{errors.subcategoryId.message}</p>
                                )}
                            </div>
                        )}

                        {(watchedSubcategoryId || userProfile?.subcategory_id) && (
                            <div>
                                <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <select
                                    id="roleId"
                                    value={watch("roleId") || userProfile?.role_id || ''}
                                    onChange={(e) => setValue("roleId", e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                                >
                                    <option value="">Select your role</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.roleId && (
                                    <p className="text-red-500 text-sm mt-1">{errors.roleId.message}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Current Ship Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-bold text-[#069B93] mb-4">Current Ship</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Which ship are you on today?
                        </label>
                        <ShipSelection
                            selectedCruiseLineId={selectedCruiseLineId}
                            selectedShipId={watch("currentShipId") || userProfile?.current_ship_id || ''}
                            onCruiseLineChange={handleCruiseLineChange}
                            onShipChange={handleShipChange}
                            placeholder="Select your current ship"
                        />
                        {errors.currentShipId && (
                            <p className="text-red-500 text-sm mt-1">{errors.currentShipId.message}</p>
                        )}
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mt-4">
                        <p className="text-sm text-blue-800">
                            <strong>Privacy Note:</strong> We'll only show today's ship to others. Your future assignments remain private.
                        </p>
                    </div>
                    
                    {/* Missing Ship Feedback */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className="text-gray-600 text-sm">Can't find your ship?</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowFeedbackModal(true)}
                                className="text-[#069B93] hover:text-[#058a7a] text-sm font-medium underline transition-colors"
                            >
                                Missing a ship or position?
                            </button>
                        </div>
                    </div>
                </div>

                {/* Cruise Schedule Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-bold text-[#069B93] mb-4">Cruise Schedule</h2>
                    <p className="text-gray-600 mb-4">
                        Add your cruise assignments to help us suggest connections when you're on the same ship or in the same port.
                    </p>
                    
                    {!showCalendar ? (
                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-xs">ℹ</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-blue-900">Schedule Management</h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Create your cruise assignments directly in Crewvar. No need to upload documents - 
                                            just select your cruise line, ship, and dates.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                type="button"
                                onClick={() => setShowCalendar(true)}
                                className="w-full px-4 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors font-medium"
                            >
                                Manage My Cruise Schedule
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">My Schedule</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowCalendar(false)}
                                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                                >
                                    Hide Calendar
                                </button>
                            </div>
                            
                            <CalendarView
                                onAddAssignment={() => setShowAssignmentForm(true)}
                                className="border-0 shadow-none"
                            />
                        </div>
                    )}
                </div>

                {/* Suggested Profiles Section */}
                {suggestedProfiles.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-xl font-bold text-[#069B93] mb-4">You're All Set!</h2>
                        <p className="text-gray-600 mb-4">Here are some crew members you might know:</p>
                        
                        <div className="space-y-4">
                            {suggestedProfiles.map((profile) => (
                                <div key={profile.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <img
                                        src={profile.avatar || defaultAvatar}
                                        alt={profile.displayName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="font-medium text-gray-900">{profile.displayName}</h3>
                                        <p className="text-sm text-gray-600">
                                            {profile.role} • {profile.shipName}
                                        </p>
                                        <p className="text-xs text-[#069B93] mt-1">
                                            They are on board {profile.shipName} today — you might know each other.
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg mt-4">
                            <p className="text-sm text-green-800">
                                <strong>Welcome to Crewvar!</strong> Your profile is now active and you can start connecting with your crew family.
                            </p>
                            <p className="text-sm text-green-700 mt-2">
                                Redirecting to your dashboard in 3 seconds...
                            </p>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                {!onboardingComplete && (
                    <div className="text-center">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            onClick={() => {
                                console.log('Button clicked!');
                                console.log('Form data:', watch());
                                console.log('User profile:', userProfile);
                                console.log('Current ship ID from form:', watch("currentShipId"));
                                console.log('Current ship ID from profile:', userProfile?.current_ship_id);
                            }}
                            className="px-8 py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors disabled:opacity-50 text-lg font-semibold"
                        >
                            {isSubmitting 
                                ? (userProfile && (userProfile.display_name || userProfile.profile_photo) 
                                    ? "Updating your profile..." 
                                    : "Setting up your profile..."
                                  )
                                : (userProfile && (userProfile.display_name || userProfile.profile_photo) 
                                    ? "Update Profile" 
                                    : "Complete Setup"
                                  )
                            }
                        </button>
                    </div>
                )}
            </form>

            {/* Assignment Form Modal */}
            {showAssignmentForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <AssignmentForm
                            onClose={() => setShowAssignmentForm(false)}
                            onSuccess={() => {
                                setShowAssignmentForm(false);
                                // Optionally refresh calendar data
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Missing Ship Feedback Modal */}
            <MissingShipFeedback
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
            />
        </div>
    );
};

export default OnboardingForm;

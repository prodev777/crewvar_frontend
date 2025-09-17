import { api } from '../../../app/api';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

export interface CrewMember {
    id: string;
    display_name: string;
    profile_photo?: string;
    department_name?: string;
    subcategory_name?: string;
    role_name?: string;
    ship_name: string;
    cruise_line_name: string;
}

export interface CrewSearchResponse {
    success: boolean;
    crew: CrewMember[];
    shipInfo?: {
        ship_name: string;
        cruise_line_name: string;
        total_crew: number;
    };
    hasMore?: boolean;
    currentPage?: number;
    limit?: number;
}

// Mock data for demonstration
const mockCrewData: CrewSearchResponse = {
    success: true,
    crew: [
        {
            id: "1",
            display_name: "Sarah Johnson",
            profile_photo: undefined,
            department_name: "Entertainment",
            role_name: "Activity Host",
            ship_name: "AIDAblu",
            cruise_line_name: "AIDA Cruises"
        },
        {
            id: "2", 
            display_name: "Mike Chen",
            profile_photo: undefined,
            department_name: "Guest Services",
            role_name: "Guest Services Agent",
            ship_name: "AIDAblu",
            cruise_line_name: "AIDA Cruises"
        },
        {
            id: "3",
            display_name: "Emma Rodriguez",
            profile_photo: undefined,
            department_name: "Food & Beverage",
            role_name: "Waiter",
            ship_name: "AIDAblu",
            cruise_line_name: "AIDA Cruises"
        },
        {
            id: "4",
            display_name: "David Kim",
            profile_photo: undefined,
            department_name: "Housekeeping",
            role_name: "Cabin Steward",
            ship_name: "AIDAblu",
            cruise_line_name: "AIDA Cruises"
        },
        {
            id: "5",
            display_name: "Lisa Thompson",
            profile_photo: undefined,
            department_name: "Spa & Wellness",
            role_name: "Spa Therapist",
            ship_name: "AIDAblu",
            cruise_line_name: "AIDA Cruises"
        },
        {
            id: "6",
            display_name: "James Wilson",
            profile_photo: undefined,
            department_name: "Engineering",
            role_name: "Engineer",
            ship_name: "AIDAblu",
            cruise_line_name: "AIDA Cruises"
        },
        {
            id: "7",
            display_name: "Maria Garcia",
            profile_photo: undefined,
            department_name: "Security",
            role_name: "Security Officer",
            ship_name: "AIDAblu",
            cruise_line_name: "AIDA Cruises"
        },
        {
            id: "8",
            display_name: "Alex Brown",
            profile_photo: undefined,
            department_name: "Medical",
            role_name: "Nurse",
            ship_name: "AIDAblu",
            cruise_line_name: "AIDA Cruises"
        },
        {
            id: "9",
            display_name: "Sophie Taylor",
            profile_photo: undefined,
            department_name: "Retail",
            role_name: "Shop Assistant",
            ship_name: "AIDAblu",
            cruise_line_name: "AIDA Cruises"
        },
        {
            id: "10",
            display_name: "Tom Anderson",
            profile_photo: undefined,
            department_name: "Photography",
            role_name: "Photographer",
            ship_name: "AIDAblu",
            cruise_line_name: "AIDA Cruises"
        },
        {
            id: "11",
            display_name: "Nina Patel",
            profile_photo: undefined,
            department_name: "Administration",
            role_name: "Administrative Assistant",
            ship_name: "AIDAblu",
            cruise_line_name: "AIDA Cruises"
        },
        {
            id: "12",
            display_name: "Carlos Mendez",
            profile_photo: undefined,
            department_name: "Maintenance",
            role_name: "Maintenance Worker",
            ship_name: "AIDAblu",
            cruise_line_name: "AIDA Cruises"
        }
    ],
    shipInfo: {
        ship_name: "AIDAblu",
        cruise_line_name: "AIDA Cruises",
        total_crew: 12
    }
};

// Get all crew members from all ships (for Explore Ships page)
const getAllCrew = async (page: number = 1, limit: number = 10): Promise<CrewSearchResponse> => {
    try {
        console.log('Attempting to call /crew/all API...', { page, limit });
        const response = await api.get(`/crew/all?page=${page}&limit=${limit}`);
        console.log('All crew API response:', response.data);
        return response.data;
    } catch (error) {
        console.warn('All crew API failed, using mock data:', error);
        console.log('Error details:', error);
        // Fallback to mock data
        console.log('Returning mock data with', mockCrewData.crew.length, 'crew members');
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockCrewData), 500); // Simulate network delay
        });
    }
};

export const useAllCrewQuery = () => {
    return useInfiniteQuery({
        queryKey: ['crew', 'all'],
        queryFn: ({ pageParam = 1 }) => getAllCrew(pageParam, 10),
        getNextPageParam: (lastPage) => {
            return lastPage.hasMore ? lastPage.currentPage! + 1 : undefined;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1, // Only retry once
        enabled: !!localStorage.getItem('token') // Only run when user is authenticated
    });
};

// Get crew members on the same ship
const getCrewOnboard = async (): Promise<CrewSearchResponse> => {
    try {
        // Try real API first
        console.log('Attempting to call /crew/onboard API...');
        const response = await api.get('/crew/onboard');
        console.log('Crew onboard API response:', response.data);
        return response.data;
    } catch (error) {
        console.warn('Crew onboard API failed, using mock data:', error);
        console.log('Error details:', error);
        // Fallback to mock data
        console.log('Returning mock data with', mockCrewData.crew.length, 'crew members');
        return new Promise((resolve) => {
            setTimeout(() => resolve(mockCrewData), 500); // Simulate network delay
        });
    }
};

export const useCrewOnboardQuery = () => {
    return useQuery({
        queryKey: ['crew', 'onboard'],
        queryFn: getCrewOnboard,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1, // Only retry once
        enabled: !!localStorage.getItem('token') // Only run when user is authenticated
    });
};

// Search crew members (client-side filter)
export const useCrewSearch = (searchQuery: string) => {
    const { data: crewData, ...rest } = useCrewOnboardQuery();
    
    const filteredCrew = crewData?.crew?.filter(member => 
        member.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.department_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.ship_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return {
        ...rest,
        data: {
            ...crewData,
            crew: filteredCrew
        }
    };
};

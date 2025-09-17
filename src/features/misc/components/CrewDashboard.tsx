import { SearchBox } from "../../../components/Form";
import { useState, ChangeEvent, useMemo } from "react";
import { useDebounce } from "../../../hooks/useDebounce";
import { sampleShips, sampleDepartments } from "../../../data/onboarding-data";
import CrewMemberPreview from "./CrewMemberPreview";
import { defaultAvatar } from "../../../utils/images";
import { WhosInPort } from "../../port/components/WhosInPort";

// Sample ports data
const ports = [
    "Miami, Florida",
    "Fort Lauderdale, Florida", 
    "Port Canaveral, Florida",
    "New York, New York",
    "Los Angeles, California",
    "Seattle, Washington",
    "Barcelona, Spain",
    "Southampton, UK",
    "Copenhagen, Denmark"
];

// Sample crew data for demonstration
const sampleCrew = [
    {
        id: "1",
        name: "Sarah Johnson",
        role: "Head Waiter",
        department: "Food & Beverage",
        avatar: defaultAvatar,
        shipName: "Royal Caribbean Symphony of the Seas",
        port: "Miami, Florida"
    },
    {
        id: "2",
        name: "Mike Chen", 
        role: "Restaurant Manager",
        department: "Food & Beverage",
        avatar: defaultAvatar,
        shipName: "Carnival Mardi Gras",
        port: "Port Canaveral, Florida"
    },
    {
        id: "3",
        name: "Emma Rodriguez",
        role: "Maitre D'",
        department: "Food & Beverage", 
        avatar: defaultAvatar,
        shipName: "Norwegian Encore",
        port: "Miami, Florida"
    },
    {
        id: "4",
        name: "David Elseword",
        role: "Bartender",
        department: "Food & Beverage",
        avatar: defaultAvatar, 
        shipName: "Royal Caribbean Symphony of the Seas",
        port: "Miami, Florida"
    },
    {
        id: "5",
        name: "Lisa Wang",
        role: "Chef de Cuisine",
        department: "Food & Beverage",
        avatar: defaultAvatar,
        shipName: "Carnival Mardi Gras", 
        port: "Port Canaveral, Florida"
    },
    {
        id: "6",
        name: "Alex Thompson",
        role: "Activity Host",
        department: "Entertainment",
        avatar: defaultAvatar,
        shipName: "Royal Caribbean Symphony of the Seas",
        port: "Miami, Florida"
    },
    {
        id: "7",
        name: "Maria Garcia",
        role: "Guest Services Agent",
        department: "Guest Services",
        avatar: defaultAvatar,
        shipName: "Norwegian Encore",
        port: "Miami, Florida"
    },
    {
        id: "8",
        name: "John Smith",
        role: "Deck Officer",
        department: "Deck",
        avatar: defaultAvatar,
        shipName: "Carnival Mardi Gras",
        port: "Port Canaveral, Florida"
    }
];

type Props = {
    isAdmin?: boolean;
}

export const CrewDashboard = (props: Props) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedShip, setSelectedShip] = useState<string>("");
    const [selectedPort, setSelectedPort] = useState<string>("");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("");

    const debouncedSearch = useDebounce(() => {
        // In a real app, this would trigger an API call
        console.log("Searching for:", searchQuery);
    }, 500);

    const handleSearchQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        debouncedSearch();
    };

    const handleSelectShip = (event: ChangeEvent<HTMLSelectElement>) => setSelectedShip(event.target.value);
    const handleSelectPort = (event: ChangeEvent<HTMLSelectElement>) => setSelectedPort(event.target.value);
    const handleSelectDepartment = (event: ChangeEvent<HTMLSelectElement>) => setSelectedDepartment(event.target.value);

    return (
        <>
            <div className="flex w-full flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-between space-y-4 sm:space-y-0 mb-8">
                <SearchBox
                    searchQuery={searchQuery}
                    handleSearchQueryChange={handleSearchQueryChange}
                />
                <div className="flex items-center space-x-2 w-full sm:w-fit">
                    <ShipSelectBox
                        selectedShip={selectedShip}
                        handleSelectShip={handleSelectShip}
                    />
                    <PortSelectBox
                        selectedPort={selectedPort}
                        handleSelectPort={handleSelectPort}
                    />
                    <DepartmentSelectBox
                        selectedDepartment={selectedDepartment}
                        handleSelectDepartment={handleSelectDepartment}
                    />
                </div>
            </div>
            
            {/* Who's in Port Section */}
            <div className="mb-8">
                <WhosInPort />
            </div>
            
            <CrewGrid
                isAdmin={props.isAdmin}
                selectedShip={selectedShip}
                selectedPort={selectedPort}
                selectedDepartment={selectedDepartment}
                searchQuery={searchQuery}
            />
        </>
    );
};

// Ship Select Box Component
const ShipSelectBox = ({ selectedShip, handleSelectShip }: {
    selectedShip: string;
    handleSelectShip: (event: ChangeEvent<HTMLSelectElement>) => void;
}) => {
    return (
        <select
            value={selectedShip}
            onChange={handleSelectShip}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
        >
            <option value="">All Ships</option>
            {sampleShips.map((ship) => (
                <option key={ship.id} value={ship.name}>
                    {ship.name}
                </option>
            ))}
        </select>
    );
};

// Port Select Box Component
const PortSelectBox = ({ selectedPort, handleSelectPort }: {
    selectedPort: string;
    handleSelectPort: (event: ChangeEvent<HTMLSelectElement>) => void;
}) => {
    return (
        <select
            value={selectedPort}
            onChange={handleSelectPort}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
        >
            <option value="">All Ports</option>
            {ports.map((port) => (
                <option key={port} value={port}>
                    {port}
                </option>
            ))}
        </select>
    );
};

// Department Select Box Component
const DepartmentSelectBox = ({ selectedDepartment, handleSelectDepartment }: {
    selectedDepartment: string;
    handleSelectDepartment: (event: ChangeEvent<HTMLSelectElement>) => void;
}) => {
    return (
        <select
            value={selectedDepartment}
            onChange={handleSelectDepartment}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
        >
            <option value="">All Departments</option>
            {sampleDepartments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                    {dept.name}
                </option>
            ))}
        </select>
    );
};

type CrewGridProps = {
    selectedShip?: string;
    selectedPort?: string;
    selectedDepartment?: string;
    searchQuery?: string;
    isAdmin?: boolean;
}

const CrewGrid = (props: CrewGridProps) => {
    const crewComponent = useMemo(() => {
        let filteredCrew = [...sampleCrew];
        
        // Filter by search query
        if (props.searchQuery && props.searchQuery !== "") {
            filteredCrew = filteredCrew.filter(crew => 
                crew.name.toLowerCase().includes(props.searchQuery!.toLowerCase()) ||
                crew.role.toLowerCase().includes(props.searchQuery!.toLowerCase())
            );
        }

        // Filter by ship
        if (props.selectedShip && props.selectedShip !== "") {
            filteredCrew = filteredCrew.filter(crew => crew.shipName === props.selectedShip);
        }

        // Filter by port
        if (props.selectedPort && props.selectedPort !== "") {
            filteredCrew = filteredCrew.filter(crew => crew.port === props.selectedPort);
        }

        // Filter by department
        if (props.selectedDepartment && props.selectedDepartment !== "") {
            filteredCrew = filteredCrew.filter(crew => crew.department === props.selectedDepartment);
        }

        return filteredCrew.map((crew) => (
            <CrewMemberPreview key={crew.id} {...crew} />
        ));
    }, [props.searchQuery, props.selectedShip, props.selectedPort, props.selectedDepartment]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {crewComponent}
        </div>
    );
};

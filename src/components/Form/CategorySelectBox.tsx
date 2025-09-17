import { FiChevronDown } from "react-icons/fi";
import { ChangeEvent } from "react";

type Props = {
    selectedDepartment?: string;
    handleSelectDepartment: (e: ChangeEvent<HTMLSelectElement>) => void;
    departments?: string[];
}

export const CategorySelectBox = (props: Props) => {
    const departments = props.departments || [
        "Deck",
        "Engine",
        "Hotel",
        "Food & Beverage",
        "Entertainment",
        "Medical",
        "Security",
        "IT",
        "Housekeeping",
        "Guest Services"
    ];

    return (
        <div className="relative w-full sm:w-32 xl:w-48">
            <select
                id="department"
                className="cursor-pointer outline-none appearance-none w-full border-[1px] border-gray-400 py-3 px-4 rounded-md bg-white text-secondary text-sm"
                value={props.selectedDepartment || ""}
                onChange={props.handleSelectDepartment}
            >
                <option value="" disabled>
                    Department
                </option>
                <option value="">All</option>
                {departments.map((department: string) => {
                    return (
                        <option key={department} value={department}>
                            {department}
                        </option>
                    );
                })}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <FiChevronDown className="w-5 h-5 text-secondary" />
            </div>
        </div>
    );
};

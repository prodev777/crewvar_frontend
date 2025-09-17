import { useQuery } from "@tanstack/react-query";
import { api } from "../../../app/api";

export interface ICruiseLine {
  id: string;
  name: string;
  company_code?: string;
  headquarters?: string;
  founded_year?: number;
  fleet_size?: number;
  website?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IShip {
  id: string;
  name: string;
  cruise_line_id: string;
  ship_code?: string;
  capacity?: number;
  length_meters?: number;
  width_meters?: number;
  gross_tonnage?: number;
  year_built?: number;
  refurbished_year?: number;
  home_port?: string;
  ship_type?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  cruise_line_name?: string;
  company_code?: string;
}

// Get all cruise lines
const getCruiseLines = async (): Promise<ICruiseLine[]> => {
  return api.get("/cruise-data/cruise-lines").then(response => response.data.cruiseLines);
};

// Get ships by cruise line
const getShipsByCruiseLine = async (cruiseLineId: string): Promise<IShip[]> => {
  return api.get(`/cruise-data/cruise-lines/${cruiseLineId}/ships`).then(response => response.data.ships);
};

// Get all ships
const getAllShips = async (): Promise<IShip[]> => {
  return api.get("/cruise-data/ships").then(response => response.data.ships);
};

// Search ships
const searchShips = async (query: string): Promise<IShip[]> => {
  return api.get(`/cruise-data/ships/search/${encodeURIComponent(query)}`).then(response => response.data.ships);
};

// Hooks
export const useCruiseLines = () => {
  return useQuery({
    queryKey: ['cruiseLines'],
    queryFn: getCruiseLines,
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!localStorage.getItem('token') // Only run when user is authenticated
  });
};

export const useShipsByCruiseLine = (cruiseLineId: string) => {
  return useQuery({
    queryKey: ['ships', cruiseLineId],
    queryFn: () => getShipsByCruiseLine(cruiseLineId),
    enabled: !!cruiseLineId && !!localStorage.getItem('token'), // Only run when user is authenticated and cruiseLineId is provided
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAllShips = () => {
  return useQuery({
    queryKey: ['allShips'],
    queryFn: getAllShips,
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!localStorage.getItem('token') // Only run when user is authenticated
  });
};

export const useSearchShips = (query: string) => {
  return useQuery({
    queryKey: ['searchShips', query],
    queryFn: () => searchShips(query),
    enabled: !!query && query.length > 2 && !!localStorage.getItem('token'), // Only run when user is authenticated and query is valid
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

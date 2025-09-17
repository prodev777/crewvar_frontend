import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../app/api";

export interface ICrewMember {
  id: string;
  display_name: string;
  profile_photo?: string;
  department_id?: string;
  subcategory_id?: string;
  role_id?: string;
  current_ship_id: string;
  ship_name: string;
  cruise_line_name: string;
  port_name?: string;
  status?: string;
}

export interface IAvailableShip {
  id: string;
  name: string;
  cruise_line_name: string;
  home_port?: string;
  capacity?: number;
}

export interface IPortLinkingResponse {
  crew: ICrewMember[];
  linkedShips: number;
  portName?: string;
}

// Get crew members in the same port
const getCrewInPort = async (date?: string): Promise<IPortLinkingResponse> => {
  const params = date ? `?date=${date}` : '';
  return api.get(`/port-linking/crew-in-port${params}`).then(response => response.data);
};

// Get available ships to link with
const getAvailableShips = async (date?: string): Promise<IAvailableShip[]> => {
  const params = date ? `?date=${date}` : '';
  return api.get(`/port-linking/available-ships${params}`).then(response => response.data.ships);
};

// Link ships in port
const linkShips = async (data: { shipId: string; portName?: string; date?: string }): Promise<any> => {
  return api.post('/port-linking/link-ships', data).then(response => response.data);
};

// Unlink ships
const unlinkShips = async (shipId: string, date?: string): Promise<any> => {
  const params = date ? `?date=${date}` : '';
  return api.delete(`/port-linking/unlink-ships/${shipId}${params}`).then(response => response.data);
};

// Hooks
export const useCrewInPort = (date?: string) => {
  return useQuery({
    queryKey: ['crewInPort', date],
    queryFn: () => getCrewInPort(date),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    enabled: !!localStorage.getItem('token') // Only run when user is authenticated
  });
};

export const useAvailableShips = (date?: string) => {
  return useQuery({
    queryKey: ['availableShips', date],
    queryFn: () => getAvailableShips(date),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!localStorage.getItem('token') // Only run when user is authenticated
  });
};

export const useLinkShips = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: linkShips,
    onSuccess: () => {
      // Invalidate and refetch crew in port data
      queryClient.invalidateQueries({ queryKey: ['crewInPort'] });
      queryClient.invalidateQueries({ queryKey: ['availableShips'] });
    },
  });
};

export const useUnlinkShips = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shipId, date }: { shipId: string; date?: string }) => unlinkShips(shipId, date),
    onSuccess: () => {
      // Invalidate and refetch crew in port data
      queryClient.invalidateQueries({ queryKey: ['crewInPort'] });
      queryClient.invalidateQueries({ queryKey: ['availableShips'] });
    },
  });
};

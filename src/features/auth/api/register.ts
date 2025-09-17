import { useMutation } from "@tanstack/react-query";
import { api } from "../../../app/api";

const register = async (credentials: IRegisterCredentials): Promise<IAuth> => {
    return api.post("/auth/register", credentials).then(response => response.data);
};

export const useRegisterMutation = () => {
    return useMutation({
        mutationFn: (credentials: IRegisterCredentials) => register(credentials),
        onSuccess: () => {
            console.log('Registration successful, verification email sent');
        },
        onError: (error: any) => {
            console.error('Registration failed:', error.response?.data?.error || error.message);
        }
    });
};
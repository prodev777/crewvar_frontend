import { useMutation } from "@tanstack/react-query";
import { api } from "../../../app/api";

const login = async (credentials: ILoginCredentials): Promise<IAuth> => {
    return api.post("/auth/login", credentials).then(response => response.data);
};

const sessionLogin = async (idToken: string): Promise<IAuth> => {
    return api.post("/auth/session-login", idToken).then(response => response.data);
};

export const useLoginMutation = () => {
    return useMutation({
        mutationFn: (credentials: ILoginCredentials) => login(credentials)
    });
};

export const useSessionLoginMutation = () => {
    return useMutation({
        mutationFn: (idToken: string) => sessionLogin(idToken)
    });
};

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./assets/styles/styles.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { QueryClientProvider, QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { persistor } from "./app/store";
import { PersistGate } from "redux-persist/integration/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AxiosError } from "axios";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                // Don't retry on 401 errors (authentication issues) or missing token errors
                if (error instanceof AxiosError && error.response?.status === 401) {
                    return false;
                }
                if (error instanceof Error && error.message === 'No authentication token available') {
                    return false;
                }
                // Retry up to 3 times for other errors
                return failureCount < 3;
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
    queryCache: new QueryCache({
        onError: (error) => {
            if (error instanceof AxiosError) {
                // Don't show toast for 401 errors to avoid spam
                if (error.response?.status !== 401) {
                    toast.error(error.message);
                }
            } else if (error instanceof Error && error.message === 'No authentication token available') {
                // Don't show toast for missing token errors
                return;
            } else if (error instanceof Error) {
                toast.error(error.message);
            }
        },
    }),
    mutationCache: new MutationCache({
        onError: (error) => {
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message);
            }
        },
    }),
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                        <App />
                    </PersistGate>
                </Provider>
            </QueryClientProvider>
        </BrowserRouter>
    </React.StrictMode>
);

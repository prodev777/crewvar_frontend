import { PortConnectionsDashboard } from "../../../components/PortConnectionsDashboard";

export const PortConnections = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#B9F3DF] via-[#E8F8F5] to-[#B9F3DF]">
            <div className="container mx-auto px-4 py-6 lg:py-8">
                {/* Header */}
                <div className="mb-6 lg:mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-[#069B93] hover:bg-[#069B93] hover:text-white"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">Update Ship Location</h1>
                            <p className="text-gray-600 text-sm lg:text-base">Manage your ship's port connections and location updates</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto">
                    <PortConnectionsDashboard />
                </div>
            </div>
        </div>
    );
};

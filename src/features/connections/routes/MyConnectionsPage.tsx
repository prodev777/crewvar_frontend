import { MyConnections } from "../components/MyConnections";

export const MyConnectionsPage = () => {
    return (
        <div className="container">
            <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
                <div className="container mx-auto px-4 py-8">
                    {/* Breadcrumbs */}
                    <div className="mb-6">
                        <nav className="text-sm">
                            <span className="text-[#069B93]">Dashboard</span>
                            <span className="mx-2 text-gray-400">&gt;</span>
                            <span className="text-gray-600">My Connections</span>
                        </nav>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div className="bg-gradient-to-r from-[#069B93] to-[#00A59E] p-6 text-white">
                                <h1 className="text-2xl font-bold">My Connections</h1>
                                <p className="text-[#B9F3DF] mt-2">View and manage your crew connections</p>
                            </div>
                            
                            <div className="p-6">
                                <MyConnections />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

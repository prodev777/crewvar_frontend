import { useRealtime } from '../context/RealtimeContext';

interface ConnectionStatusProps {
    className?: string;
}

export const ConnectionStatus = ({ className = '' }: ConnectionStatusProps) => {
    const { isConnected } = useRealtime();

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className={`text-xs font-medium ${
                isConnected ? 'text-green-700' : 'text-red-700'
            }`}>
                {isConnected ? 'Connected' : 'Disconnected'}
            </span>
        </div>
    );
};

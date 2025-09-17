import { useState } from 'react';
import { useCrewInPort, useLinkShips, ICrewMember } from '../api/portLinking';
import { useCruiseLines, useShipsByCruiseLine } from '../../cruise/api/cruiseData';
import { Spinner } from '../../../components/Elements/Spinner';
import { defaultAvatar } from '../../../utils/images';

interface WhosInPortProps {
  className?: string;
}

export const WhosInPort = ({ className = "" }: WhosInPortProps) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedCruiseLineId, setSelectedCruiseLineId] = useState("");
  const [selectedShipId, setSelectedShipId] = useState("");
  
  const today = new Date().toISOString().split('T')[0];
  
  const { data: crewData, isLoading: crewLoading, error: crewError } = useCrewInPort(today);
  const { data: cruiseLines = [], isLoading: cruiseLinesLoading } = useCruiseLines();
  const { data: shipsByCruiseLine = [], isLoading: shipsByCruiseLineLoading } = useShipsByCruiseLine(selectedCruiseLineId);
  const { mutateAsync: linkShips } = useLinkShips();
  // Removed unused unlinkShips

  const handleLinkShips = async () => {
    if (!selectedCruiseLineId || !selectedShipId) return;
    
    try {
      await linkShips({
        shipId: selectedShipId,
        date: today
      });
      
      setShowLinkModal(false);
      setSelectedCruiseLineId("");
      setSelectedShipId("");
    } catch (error) {
      console.error('Failed to link ships:', error);
      alert('Failed to link ships. Please try again.');
    }
  };

  // Removed unused handleUnlinkShip function
  // const _unusedHandleUnlinkShip = async (shipId: string) => {
  //   if (!confirm('Are you sure you want to unlink this ship?')) return;
  //   
  //   try {
  //     await unlinkShips({ shipId, date: today });
  //   } catch (error) {
  //     console.error('Failed to unlink ships:', error);
  //     alert('Failed to unlink ships. Please try again.');
  //   }
  // };

  if (crewLoading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-sm border ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Spinner />
          <span className="ml-2 text-gray-600">Loading crew in port...</span>
        </div>
      </div>
    );
  }

  if (crewError) {
    return (
      <div className={`bg-white p-6 rounded-xl shadow-lg border border-gray-100 ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Unable to load port data</h3>
          <p className="text-gray-600 mb-4">This feature requires backend connection</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const crew = crewData?.crew || [];
  const linkedShips = crewData?.linkedShips || 0;
  const portName = crewData?.portName;

  return (
    <div className={`bg-white p-8 rounded-2xl shadow-xl border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#069B93] mb-2">🚢 Who's in Your Port</h2>
          <p className="text-gray-600">
            {portName ? `Currently docked in ${portName}` : 'Connect with crew from other ships in your port'}
          </p>
        </div>
        <button
          onClick={() => setShowLinkModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-[#069B93] to-[#058a7a] text-white rounded-xl hover:from-[#058a7a] hover:to-[#047a6a] transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          + Link Ships
        </button>
      </div>

      {/* Port Status */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-base font-semibold text-blue-800">
            {linkedShips > 0 
              ? `🔗 Linked with ${linkedShips} ship${linkedShips > 1 ? 's' : ''} today`
              : '⚓ No ships linked today'
            }
          </span>
        </div>
        {linkedShips === 0 && (
          <p className="text-blue-600 text-sm mt-2 ml-7">
            Click "Link Ships" to connect with other ships in your port and discover crew members
          </p>
        )}
      </div>

      {/* Crew Members */}
      {crew.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-bold text-gray-800">👥 Crew Members</h3>
            <span className="bg-[#069B93] text-white text-sm px-3 py-1 rounded-full font-medium">
              {crew.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crew.map((member: ICrewMember) => (
              <div key={member.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-[#069B93] transition-all duration-200 group">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={member.profile_photo || defaultAvatar}
                      alt={member.display_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md group-hover:border-[#069B93] transition-colors"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate group-hover:text-[#069B93] transition-colors">
                      {member.display_name}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">{member.ship_name}</p>
                    <p className="text-xs text-gray-500 truncate">{member.cruise_line_name}</p>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-[#069B93] text-white text-sm rounded-lg hover:bg-[#058a7a] transition-colors font-medium">
                    Connect
                  </button>
                  <button className="px-3 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:border-[#069B93] hover:text-[#069B93] transition-colors">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No crew members found</h3>
          <p className="text-gray-500 mb-6">Link with ships in your port to discover crew members</p>
          <button
            onClick={() => setShowLinkModal(true)}
            className="px-6 py-3 bg-[#069B93] text-white rounded-xl hover:bg-[#058a7a] transition-colors font-semibold"
          >
            Link Ships Now
          </button>
        </div>
      )}

      {/* Link Ships Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Link Ships in Port</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Cruise Line
                </label>
                {cruiseLinesLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <span className="text-gray-500">Loading cruise lines...</span>
                  </div>
                ) : (
                  <select
                    value={selectedCruiseLineId}
                    onChange={(e) => {
                      setSelectedCruiseLineId(e.target.value);
                      setSelectedShipId(""); // Reset ship selection when cruise line changes
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                  >
                    <option value="">Choose a cruise line...</option>
                    {cruiseLines.map((cruiseLine) => (
                      <option key={cruiseLine.id} value={cruiseLine.id}>
                        {cruiseLine.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Ship to Link With
                </label>
                {!selectedCruiseLineId ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <span className="text-gray-500">Please select a cruise line first</span>
                  </div>
                ) : shipsByCruiseLineLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <span className="text-gray-500">Loading ships...</span>
                  </div>
                ) : (
                  <select
                    value={selectedShipId}
                    onChange={(e) => setSelectedShipId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                  >
                    <option value="">Choose a ship...</option>
                    {shipsByCruiseLine.map((ship) => (
                      <option key={ship.id} value={ship.id}>
                        {ship.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowLinkModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLinkShips}
                disabled={!selectedCruiseLineId || !selectedShipId}
                className="flex-1 px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Link Ships
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

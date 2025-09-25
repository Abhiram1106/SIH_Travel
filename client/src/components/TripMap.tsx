import React, { useEffect } from 'react';

interface RouteInfo {
  distance: string;
  duration: string;
  estimatedCost: number;
}

interface TripMapProps {
  destination: string;
  onRouteCalculated: (info: RouteInfo) => void;
}

const TripMap: React.FC<TripMapProps> = ({ destination, onRouteCalculated }) => {
  useEffect(() => {
    // Simulate route calculation and call onRouteCalculated prop
    const mockRouteInfo: RouteInfo = {
      distance: '500 km',
      duration: '6h 30m',
      estimatedCost: 150,
    };
    onRouteCalculated(mockRouteInfo);
  }, [destination, onRouteCalculated]);

  return (
    <div style={{ width: '100%', height: '300px', backgroundColor: '#eef2ff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <p>Map visualization for destination: <strong>{destination}</strong></p>
    </div>
  );
};

export default TripMap;

import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Navigation, AlertCircle, Wifi, WifiOff, Play, Square, Loader, Edit3, Save, MapIcon, Target, RefreshCw, AlertTriangle, Car, Bus, Bike, Footprints, Search } from 'lucide-react';
import { SocketContext } from '../App';
import toast from 'react-hot-toast';

interface LocationData {
  lat: number;
  lng: number;
  timestamp: string;
  name: string;
}

interface TripData {
  destination: string;
  startDate: string;
  endDate: string;
}

interface RouteData {
  distance: string;
  duration: string;
  durationInTraffic: string;
  trafficCondition: 'light' | 'moderate' | 'heavy';
  travelMode: string;
}

interface RouteOption {
  route: any;
  distance: string;
  duration: string;
  durationInTraffic: string;
  trafficCondition: 'light' | 'moderate' | 'heavy';
  timeInSeconds: number;
  travelMode: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const RealTimeMap: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { socket, isConnected } = useContext(SocketContext);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const directionsServiceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const alternateDirectionsRendererRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const destinationMarkerRef = useRef<any>(null);
  const trafficMonitorRef = useRef<any>(null);
  
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [isGPSTracking, setIsGPSTracking] = useState(false);
  const [isManualTracking, setIsManualTracking] = useState(false);
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [trafficLayer, setTrafficLayer] = useState<any>(null);
  
  // Location input states
  const [locationInput, setLocationInput] = useState('');
  const [isGeocodingLocation, setIsGeocodingLocation] = useState(false);
  const [locationSource, setLocationSource] = useState<'gps' | 'manual'>('manual');

  // Transportation mode states
  const [travelMode, setTravelMode] = useState<'driving' | 'transit' | 'bicycling' | 'walking'>('driving');
  
  // Traffic and rerouting states
  const [isMonitoringTraffic, setIsMonitoringTraffic] = useState(false);
  const [availableRoutes, setAvailableRoutes] = useState<RouteOption[]>([]);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
  const [lastRouteUpdate, setLastRouteUpdate] = useState<Date | null>(null);
  const [isRerouting, setIsRerouting] = useState(false);
  const [routeChanges, setRouteChanges] = useState(0);

  // Enhanced API Configuration with multiple fallbacks
  const API_CONFIG = {
    GOOGLE_MAPS_API_KEY: 'AIzaSyDent38w0oIkR00Y6dw5cIoL5RvE1zv0Ow',
    BACKUP_API_KEY: 'AIzaSyBnwdiFB1PtI2H3sITz_AUnSxZhimC8vWQ', // Same for now, can be different
    GEOCODING_ENDPOINTS: [
      'https://maps.googleapis.com/maps/api/geocode/json',
      'https://geocode.maps.co/search' // Free alternative fallback
    ]
  };

  // Transportation modes
  const transportationModes = [
    { id: 'driving', name: 'Car', icon: Car, color: 'bg-blue-500', description: 'By car with traffic info' },
    { id: 'transit', name: 'Bus/Train', icon: Bus, color: 'bg-green-500', description: 'Public transportation' },
    { id: 'bicycling', name: 'Bike', icon: Bike, color: 'bg-orange-500', description: 'Bicycle routes' },
    { id: 'walking', name: 'Walking', icon: Footprints, color: 'bg-purple-500', description: 'Walking directions' }
  ];

  // Enhanced location suggestions with coordinates
  const locationSuggestions = [
    { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777 },
    { name: 'Delhi, India', lat: 28.7041, lng: 77.1025 },
    { name: 'Bangalore, India', lat: 12.9716, lng: 77.5946 },
    { name: 'Hyderabad, India', lat: 17.3850, lng: 78.4867 },
    { name: 'Chennai, India', lat: 13.0827, lng: 80.2707 },
    { name: 'Kolkata, India', lat: 22.5726, lng: 88.3639 },
    { name: 'Pune, India', lat: 18.5204, lng: 73.8567 },
    { name: 'Ahmedabad, India', lat: 23.0225, lng: 72.5714 },
    { name: 'New York, USA', lat: 40.7128, lng: -74.0060 },
    { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
    { name: 'Paris, France', lat: 48.8566, lng: 2.3522 },
    { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 }
  ];

  useEffect(() => {
    loadTripData();
    initializeGoogleMaps();
    
    if (socket) {
      socket.on('location-alert', handleLocationAlert);
      socket.on('traffic-update', handleTrafficUpdate);
      return () => {
        socket.off('location-alert');
        socket.off('traffic-update');
      };
    }
  }, [socket, tripId]);

  // Start traffic monitoring when navigation starts
  useEffect(() => {
    if (isManualTracking || isGPSTracking) {
      startTrafficMonitoring();
    } else {
      stopTrafficMonitoring();
    }

    return () => {
      stopTrafficMonitoring();
    };
  }, [isManualTracking, isGPSTracking]);

  const loadTripData = () => {
    try {
      const storedTripData = localStorage.getItem('currentTripData');
      if (storedTripData) {
        const trip = JSON.parse(storedTripData);
        setTripData(trip);
        
        // Use destination coordinates from trip data if available
        if (trip.travelDetails && trip.travelDetails.destCoordinates) {
          setDestination({
            lat: trip.travelDetails.destCoordinates.lat,
            lng: trip.travelDetails.destCoordinates.lng,
            name: trip.destination
          });
          toast.success(`📍 Trip destination loaded: ${trip.destination}`);
        } else {
          // Fallback to geocoding destination name
          geocodeDestinationFromTrip(trip.destination);
        }
      } else {
        toast('No trip data found. You can still use navigation by setting your location.');
      }
    } catch (error) {
      console.error('Error loading trip data:', error);
      toast.error('Error loading trip data');
    }
  };

  const geocodeDestinationFromTrip = async (destinationName: string) => {
    try {
      const coordinates = await geocodeLocation(destinationName);
      if (coordinates) {
        setDestination({
          lat: coordinates.lat,
          lng: coordinates.lng,
          name: destinationName
        });
        toast.success(`🎯 Trip destination found: ${destinationName}`);
      } else {
        toast(`⚠️ Could not find coordinates for destination: ${destinationName}`, { icon: '⚠️' });
        // Set a default destination
        setDestination({ lat: 17.3850, lng: 78.4867, name: destinationName });
      }
    } catch (error) {
      console.error('Error geocoding destination:', error);
      toast.error('Failed to find destination coordinates');
    }
  };

  // Enhanced geocoding function with multiple fallbacks and better error handling
  const geocodeLocation = async (locationName: string): Promise<{ lat: number; lng: number; formattedAddress?: string } | null> => {
    if (!locationName || !locationName.trim()) {
      throw new Error('Location name is required');
    }

    const cleanLocationName = locationName.trim();
    console.log('Geocoding location:', cleanLocationName);

    // First, check if we have this location in our suggestions
    const suggestionMatch = locationSuggestions.find(suggestion => 
      suggestion.name.toLowerCase().includes(cleanLocationName.toLowerCase()) ||
      cleanLocationName.toLowerCase().includes(suggestion.name.toLowerCase())
    );

    if (suggestionMatch) {
      console.log('Found matching suggestion:', suggestionMatch);
      return {
        lat: suggestionMatch.lat,
        lng: suggestionMatch.lng,
        formattedAddress: suggestionMatch.name
      };
    }

    // Try Google Geocoding API
    try {
      console.log('Attempting Google Geocoding...');
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cleanLocationName)}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Google Geocoding response:', data);
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formattedAddress: result.formatted_address
        };
      } else {
        console.error('Google Geocoding failed:', data.status, data.error_message);
        throw new Error(`Google Geocoding failed: ${data.status} ${data.error_message || ''}`);
      }
    } catch (error) {
      console.error('Google Geocoding error:', error);
      
      // Fallback: Try alternative geocoding service (free)
      try {
        console.log('Trying fallback geocoding service...');
        const fallbackResponse = await fetch(
          `https://geocode.maps.co/search?q=${encodeURIComponent(cleanLocationName)}&format=json&limit=1`
        );
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          console.log('Fallback geocoding response:', fallbackData);
          
          if (fallbackData && fallbackData.length > 0) {
            return {
              lat: parseFloat(fallbackData[0].lat),
              lng: parseFloat(fallbackData[0].lon),
              formattedAddress: fallbackData[0].display_name
            };
          }
        }
      } catch (fallbackError) {
        console.error('Fallback geocoding also failed:', fallbackError);
      }
      
      // Final fallback: Check if it's a known city pattern
      const cityPatterns = {
        'delhi': { lat: 28.7041, lng: 77.1025 },
        'mumbai': { lat: 19.0760, lng: 72.8777 },
        'bangalore': { lat: 12.9716, lng: 77.5946 },
        'hyderabad': { lat: 17.3850, lng: 78.4867 },
        'chennai': { lat: 13.0827, lng: 80.2707 },
        'kolkata': { lat: 22.5726, lng: 88.3639 },
        'pune': { lat: 18.5204, lng: 73.8567 },
        'new york': { lat: 40.7128, lng: -74.0060 },
        'london': { lat: 51.5074, lng: -0.1278 },
        'paris': { lat: 48.8566, lng: 2.3522 },
        'tokyo': { lat: 35.6762, lng: 139.6503 }
      };
      
      const normalizedLocation = cleanLocationName.toLowerCase();
      for (const [pattern, coords] of Object.entries(cityPatterns)) {
        if (normalizedLocation.includes(pattern)) {
          console.log(`Using pattern match for ${pattern}:`, coords);
          return {
            lat: coords.lat,
            lng: coords.lng,
            formattedAddress: cleanLocationName
          };
        }
      }
      
      throw error;
    }
  };

  const geocodeUserLocation = async (locationName: string) => {
    if (!locationName.trim()) {
      toast.error('Please enter a location name');
      return;
    }

    setIsGeocodingLocation(true);
    const loadingToast = toast.loading(`🔍 Finding location: ${locationName}...`);

    try {
      const result = await geocodeLocation(locationName);
      
      if (result) {
        const location: LocationData = {
          lat: result.lat,
          lng: result.lng,
          timestamp: new Date().toISOString(),
          name: result.formattedAddress || locationName
        };
        
        setCurrentLocation(location);
        setLocationSource('manual');
        
        // Create the map when location is set for the first time
        if (!googleMapRef.current) {
          createGoogleMap(location);
        } else {
          updateMapLocation(location);
        }
        
        // Calculate route with current travel mode
        if (destination) {
          calculateAndDisplayRoute(location, travelMode);
        }
        
        toast.dismiss(loadingToast);
        toast.success(`📍 Location found: ${result.formattedAddress || locationName}`);
        
      } else {
        toast.dismiss(loadingToast);
        toast.error(`❌ Location "${locationName}" not found. Please try a different location or check spelling.`);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Geocoding error:', error);
      
      // Provide helpful error messages
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('ZERO_RESULTS')) {
        toast.error(`❌ "${locationName}" not found. Try adding country name (e.g., "Delhi, India")`);
      } else if (errorMessage.includes('OVER_QUERY_LIMIT')) {
        toast.error('❌ Too many requests. Please try again in a moment.');
      } else if (errorMessage.includes('REQUEST_DENIED')) {
        toast.error('❌ Geocoding service unavailable. Please try GPS location.');
      } else {
        toast.error(`❌ Could not find "${locationName}". Please check spelling and try again.`);
      }
    } finally {
      setIsGeocodingLocation(false);
    }
  };

  const initializeGoogleMaps = () => {
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_CONFIG.GOOGLE_MAPS_API_KEY}&libraries=geometry,places&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    window.initMap = initializeMap;
    
    script.onerror = () => {
      setMapError('Failed to load Google Maps API. Please check your internet connection.');
      setIsMapLoading(false);
      toast.error('Failed to load Google Maps. Please refresh the page.');
    };

    script.onload = () => {
      console.log('Google Maps API loaded successfully');
    };

    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current) return;

    try {
      setIsMapLoading(false);
      toast.success('🗺️ Google Maps ready - please set your starting location');
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Error initializing Google Maps');
      setIsMapLoading(false);
    }
  };

  const setLocationFromInput = () => {
    if (!locationInput.trim()) {
      toast.error('Please enter a location name');
      return;
    }
    
    geocodeUserLocation(locationInput.trim());
  };

  const selectSuggestion = (suggestion: { name: string; lat: number; lng: number }) => {
    const location: LocationData = {
      lat: suggestion.lat,
      lng: suggestion.lng,
      timestamp: new Date().toISOString(),
      name: suggestion.name
    };
    
    setCurrentLocation(location);
    setLocationInput(suggestion.name);
    setLocationSource('manual');
    
    // Create the map when location is set for the first time
    if (!googleMapRef.current) {
      createGoogleMap(location);
    } else {
      updateMapLocation(location);
    }
    
    // Calculate route with current travel mode
    if (destination) {
      calculateAndDisplayRoute(location, travelMode);
    }
    
    toast.success(`📍 Location set to ${suggestion.name}`);
  };

  const useGPSLocation = () => {
    if (navigator.geolocation) {
      toast.loading('📡 Getting your GPS location...');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Reverse geocode to get location name
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`
            );
            const data = await response.json();
            
            let locationName = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            if (data.status === 'OK' && data.results.length > 0) {
              locationName = data.results[0].formatted_address;
            }
            
            const location: LocationData = {
              lat: lat,
              lng: lng,
              timestamp: new Date().toISOString(),
              name: locationName
            };
            
            setCurrentLocation(location);
            setLocationInput(locationName);
            setLocationSource('gps');
            
            // Create the map when GPS location is obtained for the first time
            if (!googleMapRef.current) {
              createGoogleMap(location);
            } else {
              updateMapLocation(location);
            }
            
            // Calculate route with current travel mode
            if (destination) {
              calculateAndDisplayRoute(location, travelMode);
            }
            
            toast.dismiss();
            toast.success('🛰️ GPS location obtained successfully');
          } catch (error) {
            toast.dismiss();
            console.error('Reverse geocoding error:', error);
            
            // Even if reverse geocoding fails, we still have coordinates
            const location: LocationData = {
              lat: lat,
              lng: lng,
              timestamp: new Date().toISOString(),
              name: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
            };
            
            setCurrentLocation(location);
            setLocationInput(location.name);
            setLocationSource('gps');
            
            if (!googleMapRef.current) {
              createGoogleMap(location);
            } else {
              updateMapLocation(location);
            }
            
            if (destination) {
              calculateAndDisplayRoute(location, travelMode);
            }
            
            toast.success('🛰️ GPS location obtained (coordinates only)');
          }
        },
        (error) => {
          toast.dismiss();
          console.error('Error getting GPS location:', error);
          let errorMessage = 'GPS location failed: ';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Location access denied. Please enable location permissions.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'Unknown error occurred.';
              break;
          }
          
          toast.error(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      toast.error('GPS is not supported by this browser');
    }
  };

  const updateMapLocation = (location: LocationData) => {
    if (userMarkerRef.current) {
      userMarkerRef.current.setPosition({ lat: location.lat, lng: location.lng });
      userMarkerRef.current.setAnimation(window.google.maps.Animation.BOUNCE);
      setTimeout(() => {
        if (userMarkerRef.current) {
          userMarkerRef.current.setAnimation(null);
        }
      }, 1000);
    }
    
    if (googleMapRef.current) {
      googleMapRef.current.setCenter({ lat: location.lat, lng: location.lng });
    }
  };

  const createGoogleMap = (userLocation: LocationData) => {
    if (!userLocation || !mapRef.current || !window.google) return;

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: userLocation.lat, lng: userLocation.lng },
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi.business',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'greedy'
      });

      googleMapRef.current = map;

      // Add traffic layer
      const traffic = new window.google.maps.TrafficLayer();
      traffic.setMap(map);
      setTrafficLayer(traffic);

      // Initialize directions service and renderers
      directionsServiceRef.current = new window.google.maps.DirectionsService();
      
      // Main route renderer
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: getTravelModeColor(travelMode),
          strokeWeight: 8,
          strokeOpacity: 0.9
        },
        preserveViewport: false
      });
      directionsRendererRef.current.setMap(map);

      // Alternate route renderer
      alternateDirectionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#34A853',
          strokeWeight: 5,
          strokeOpacity: 0.7,
          strokeDasharray: [10, 5]
        },
        preserveViewport: true
      });

      // Create custom user location marker
      userMarkerRef.current = new window.google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map: map,
        title: userLocation.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="${getTravelModeColor(travelMode)}" stroke="white" stroke-width="3"/>
              <circle cx="12" cy="12" r="4" fill="white"/>
              ${isManualTracking || isGPSTracking ? '<circle cx="12" cy="12" r="14" fill="none" stroke="' + getTravelModeColor(travelMode) + '" stroke-width="2" opacity="0.5" stroke-dasharray="4,4"/>' : ''}
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        },
        zIndex: 1000
      });

      // Create destination marker if available
      if (destination) {
        destinationMarkerRef.current = new window.google.maps.Marker({
          position: { lat: destination.lat, lng: destination.lng },
          map: map,
          title: destination.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335" stroke="white" stroke-width="2"/>
                <circle cx="12" cy="9" r="3" fill="white"/>
                <text x="12" y="13" text-anchor="middle" fill="white" font-size="8" font-weight="bold">END</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 40)
          },
          zIndex: 1001
        });

        // Immediately calculate and display the route
        calculateAndDisplayRoute(userLocation, travelMode);
      }

      setMapError(null);
      toast.success('🗺️ Map created successfully! Select travel mode and start navigation.');
      
    } catch (error) {
      console.error('Error creating Google Map:', error);
      setMapError('Error creating map: ' + (error as Error).message);
    }
  };

  const getTravelModeColor = (mode: string) => {
    switch (mode) {
      case 'driving': return '#4285F4';
      case 'transit': return '#34A853';
      case 'bicycling': return '#FF6B35';
      case 'walking': return '#8E44AD';
      default: return '#4285F4';
    }
  };

  const getTravelModeIcon = (mode: string) => {
    switch (mode) {
      case 'driving': return '🚗';
      case 'transit': return '🚌';
      case 'bicycling': return '🚴';
      case 'walking': return '🚶';
      default: return '🚗';
    }
  };

  const handleTravelModeChange = (newMode: 'driving' | 'transit' | 'bicycling' | 'walking') => {
    setTravelMode(newMode);
    
    // Update route with new travel mode
    if (currentLocation && destination) {
      calculateAndDisplayRoute(currentLocation, newMode);
    }
    
    // Update marker colors
    if (userMarkerRef.current) {
      userMarkerRef.current.setIcon({
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="${getTravelModeColor(newMode)}" stroke="white" stroke-width="3"/>
            <circle cx="12" cy="12" r="4" fill="white"/>
            ${isManualTracking || isGPSTracking ? '<circle cx="12" cy="12" r="14" fill="none" stroke="' + getTravelModeColor(newMode) + '" stroke-width="2" opacity="0.5" stroke-dasharray="4,4"/>' : ''}
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 16)
      });
    }
    
    toast.success(`${getTravelModeIcon(newMode)} Travel mode changed to ${newMode}`);
  };

  const calculateAndDisplayRoute = (userLocation: LocationData, mode: string) => {
    if (!directionsServiceRef.current || !userLocation || !destination) {
      console.log('Missing requirements for route calculation');
      return;
    }

    console.log('Calculating route from', userLocation.name, 'to', destination.name, 'via', mode);

    // Convert our travel mode to Google Maps travel mode
    let googleTravelMode;
    switch (mode) {
      case 'driving':
        googleTravelMode = window.google.maps.TravelMode.DRIVING;
        break;
      case 'transit':
        googleTravelMode = window.google.maps.TravelMode.TRANSIT;
        break;
      case 'bicycling':
        googleTravelMode = window.google.maps.TravelMode.BICYCLING;
        break;
      case 'walking':
        googleTravelMode = window.google.maps.TravelMode.WALKING;
        break;
      default:
        googleTravelMode = window.google.maps.TravelMode.DRIVING;
    }

    const request = {
      origin: { lat: userLocation.lat, lng: userLocation.lng },
      destination: { lat: destination.lat, lng: destination.lng },
      travelMode: googleTravelMode,
      drivingOptions: mode === 'driving' ? {
        departureTime: new Date(),
        trafficModel: window.google.maps.TrafficModel.BEST_GUESS
      } : undefined,
      transitOptions: mode === 'transit' ? {
        departureTime: new Date(),
        modes: [window.google.maps.TransitMode.BUS, window.google.maps.TransitMode.RAIL, window.google.maps.TransitMode.SUBWAY],
        routingPreference: window.google.maps.TransitRoutePreference.LESS_WALKING
      } : undefined,
      unitSystem: window.google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false,
      provideRouteAlternatives: true
    };

    directionsServiceRef.current.route(request, (result: any, status: any) => {
      console.log('Route calculation result:', status, result);
      
      if (status === 'OK' && result && result.routes && result.routes.length > 0) {
        // Display the main route
        directionsRendererRef.current.setDirections(result);
        
        // Update route styling based on travel mode
        const routeColor = getTravelModeColor(mode);
        directionsRendererRef.current.setOptions({
          polylineOptions: {
            strokeColor: routeColor,
            strokeWeight: 8,
            strokeOpacity: 0.9
          }
        });

        // Extract route information
        const mainRoute = result.routes[0];
        const leg = mainRoute.legs[0];
        
        const normalTime = leg.duration.value;
        const trafficTime = leg.duration_in_traffic ? leg.duration_in_traffic.value : normalTime;
        const delay = ((trafficTime - normalTime) / normalTime) * 100;
        
        let trafficCondition: 'light' | 'moderate' | 'heavy';
        if (delay < 15) trafficCondition = 'light';
        else if (delay < 40) trafficCondition = 'moderate';
        else trafficCondition = 'heavy';

        const routeInfo: RouteData = {
          distance: leg.distance.text,
          duration: leg.duration.text,
          durationInTraffic: leg.duration_in_traffic ? leg.duration_in_traffic.text : leg.duration.text,
          trafficCondition,
          travelMode: mode
        };
        
        setRouteData(routeInfo);
        setLastRouteUpdate(new Date());

        // Show alternate route if available
        if (result.routes.length > 1) {
          alternateDirectionsRendererRef.current.setMap(googleMapRef.current);
          alternateDirectionsRendererRef.current.setDirections({
            ...result,
            routes: [result.routes[1]]
          });
          console.log('Showing alternate route');
        }

        // Fit map to show the entire route with padding
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
        bounds.extend({ lat: destination.lat, lng: destination.lng });
        googleMapRef.current.fitBounds(bounds, { padding: 80 });

        // Show route information
        const modeIcon = getTravelModeIcon(mode);
        const trafficIcon = trafficCondition === 'light' ? '🟢' : 
                           trafficCondition === 'moderate' ? '🟡' : '🔴';
        
        toast.success(`${modeIcon} ${trafficIcon} ${mode.toUpperCase()}: ${routeInfo.distance} • ${routeInfo.durationInTraffic}`, {
          duration: 4000,
        });

        console.log('Route displayed successfully:', routeInfo);
        
      } else {
        console.error('Directions request failed:', status);
        toast.error(`Failed to calculate ${mode} route: ${status}`);
        setMapError(`Route calculation failed: ${status}`);
      }
    });
  };

  const startManualNavigation = () => {
    if (!currentLocation) {
      toast.error('Please set your starting location first');
      return;
    }

    if (!destination) {
      toast.error('No destination found for this trip');
      return;
    }

    if (isGPSTracking) {
      stopLocationTracking();
      setIsGPSTracking(false);
    }

    setIsManualTracking(true);
    setLocationSource('manual');
    setRouteChanges(0);
    
    if (socket && tripId) {
      socket.emit('trip-started', {
        tripId,
        startLocation: currentLocation,
        startTime: new Date().toISOString(),
        trackingMode: 'manual',
        travelMode: travelMode
      });
    }

    toast.success(`🎯 ${getTravelModeIcon(travelMode)} Navigation started via ${travelMode.toUpperCase()}`);
    
    // Ensure route is displayed when navigation starts
    calculateAndDisplayRoute(currentLocation, travelMode);
  };

  const stopManualNavigation = () => {
    setIsManualTracking(false);
    stopTrafficMonitoring();
    
    if (socket && tripId) {
      socket.emit('trip-stopped', {
        tripId,
        endLocation: currentLocation,
        endTime: new Date().toISOString(),
        trackingMode: 'manual'
      });
    }

    toast.success('🛑 Navigation stopped');
  };

  const startTrafficMonitoring = () => {
    if (!currentLocation || !destination) return;
    
    setIsMonitoringTraffic(true);
    
    // Monitor traffic every 3 minutes during navigation (only for driving)
    if (travelMode === 'driving') {
      trafficMonitorRef.current = setInterval(() => {
        if (currentLocation && destination && (isManualTracking || isGPSTracking)) {
          calculateAndDisplayRoute(currentLocation, travelMode);
        }
      }, 180000); // 3 minutes
      
      toast.success('🚦 Smart traffic monitoring started');
    }
  };

  const stopTrafficMonitoring = () => {
    setIsMonitoringTraffic(false);
    
    if (trafficMonitorRef.current) {
      clearInterval(trafficMonitorRef.current);
      trafficMonitorRef.current = null;
    }
  };

  const refreshRoute = () => {
    if (currentLocation && destination) {
      toast.loading(`🔄 Refreshing ${travelMode} route...`);
      calculateAndDisplayRoute(currentLocation, travelMode);
    }
  };

  const handleTrafficUpdate = (data: any) => {
    const { severity, location, message } = data;
    
    if (severity === 'high') {
      toast.error(`🚨 Traffic Alert: ${message}`);
      if (currentLocation && destination) {
        calculateAndDisplayRoute(currentLocation, travelMode);
      }
    } else {
      toast(`🚦 Traffic Update: ${message}`, { icon: '📍' });
    }
  };

  const toggleGPSTracking = () => {
    setIsGPSTracking(!isGPSTracking);
    
    if (!isGPSTracking) {
      if (isManualTracking) {
        stopManualNavigation();
      }
      toast.success(`🛰️ GPS tracking started for ${travelMode} navigation`);
      startLocationTracking();
    } else {
      toast.success('⏹️ GPS tracking stopped');
      stopLocationTracking();
    }
  };

  const startLocationTracking = () => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Reverse geocode to get location name
          let locationName = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`
            );
            const data = await response.json();
            if (data.status === 'OK' && data.results.length > 0) {
              locationName = data.results[0].formatted_address;
            }
          } catch (error) {
            console.error('Reverse geocoding error:', error);
          }
          
          const newLocation: LocationData = {
            lat: lat,
            lng: lng,
            timestamp: new Date().toISOString(),
            name: locationName
          };
          
          setCurrentLocation(newLocation);
          setLocationInput(locationName);
          setLocationSource('gps');
          
          if (userMarkerRef.current) {
            userMarkerRef.current.setPosition({
              lat: newLocation.lat,
              lng: newLocation.lng
            });
          }
          
          if (destination) {
            calculateAndDisplayRoute(newLocation, travelMode);
          }
          
          if (socket && tripId) {
            socket.emit('location-update', {
              tripId,
              location: newLocation,
              travelMode: travelMode
            });
          }
        },
        (error) => {
          console.error('Location tracking error:', error);
          toast.error('GPS tracking failed: ' + error.message);
          setIsGPSTracking(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000
        }
      );

      (window as any).locationWatchId = watchId;
    } else {
      toast.error('Geolocation is not supported by this browser');
      setIsGPSTracking(false);
    }
  };

  const stopLocationTracking = () => {
    if ((window as any).locationWatchId) {
      navigator.geolocation.clearWatch((window as any).locationWatchId);
      (window as any).locationWatchId = null;
    }
  };

  const handleLocationAlert = (data: any) => {
    const { alerts } = data;
    if (alerts) {
      alerts.forEach((alert: any) => {
        if (alert.severity === 'high') {
          toast.error(`⚠️ ${alert.message}`);
        } else {
          toast(`📍 ${alert.message}`);
        }
      });
    }
  };

  const centerMapOnUser = () => {
    if (googleMapRef.current && currentLocation) {
      googleMapRef.current.setCenter({
        lat: currentLocation.lat,
        lng: currentLocation.lng
      });
      googleMapRef.current.setZoom(15);
      toast.success('📍 Map centered on your location');
    }
  };

  const centerMapOnRoute = () => {
    if (googleMapRef.current && currentLocation && destination) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: currentLocation.lat, lng: currentLocation.lng });
      bounds.extend({ lat: destination.lat, lng: destination.lng });
      googleMapRef.current.fitBounds(bounds, { padding: 100 });
      toast.success('🗺️ Showing full route');
    }
  };

  const toggleTraffic = () => {
    if (trafficLayer && googleMapRef.current) {
      if (trafficLayer.getMap()) {
        trafficLayer.setMap(null);
        toast.success('Traffic layer hidden');
      } else {
        trafficLayer.setMap(googleMapRef.current);
        toast.success('Traffic layer visible');
      }
    }
  };

  useEffect(() => {
    return () => {
      stopLocationTracking();
      stopTrafficMonitoring();
    };
  }, []);

  // Utility functions
  const getTrackingStatus = () => {
    if (isGPSTracking) return `GPS ${travelMode.toUpperCase()}`;
    if (isManualTracking) return `Manual ${travelMode.toUpperCase()}`;
    return 'Not Started';
  };

  const getTrackingColor = () => {
    if (isGPSTracking) return 'text-blue-600';
    if (isManualTracking) return getTravelModeColor(travelMode) === '#4285F4' ? 'text-blue-600' : 'text-orange-600';
    return 'text-gray-600';
  };

  const getTrafficColor = (condition?: string) => {
    switch (condition) {
      case 'light': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'heavy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrafficIcon = (condition?: string) => {
    switch (condition) {
      case 'light': return '🟢';
      case 'moderate': return '🟡';
      case 'heavy': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <MapPin className="w-8 h-8 text-indigo-600 mr-3" />
              🗺️ Smart Location Navigation
            </h1>
            <p className="text-gray-600 mt-2">
              {tripData ? `Navigate to ${tripData.destination} using location names` : 'Enter location names and choose your preferred transportation mode'}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-100 text-green-800">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">API Ready ✅</span>
            </div>
            
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </motion.div>

      {/* Location Input & Transportation Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <Search className="w-6 h-6 text-indigo-600 mr-2" />
          Location Search & Transportation
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Location Search */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">📍 Set Your Starting Location</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Location Name</label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && setLocationFromInput()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Mumbai, India or New York, USA"
                    disabled={isGeocodingLocation}
                  />
                  <button
                    onClick={setLocationFromInput}
                    disabled={isGeocodingLocation || !locationInput.trim()}
                    className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeocodingLocation ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Find
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={useGPSLocation}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Use GPS Location
                </button>
              </div>
            </div>

            {/* Location Suggestions */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">Quick Suggestions:</h4>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {locationSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectSuggestion(suggestion)}
                    className="text-left px-3 py-2 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors border border-gray-200 hover:border-indigo-300 text-sm"
                  >
                    <div className="font-medium text-gray-800">{suggestion.name.split(',')[0]}</div>
                    <div className="text-xs text-gray-500">{suggestion.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Location Display */}
            {currentLocation && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">📍 Current Location:</h4>
                <p className="text-sm text-gray-600 font-medium">{currentLocation.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Coordinates: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </p>
                <p className="text-xs text-gray-500">
                  Source: {locationSource === 'gps' ? '🛰️ GPS' : '🔍 Search'} • 
                  Updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>

          {/* Transportation Mode Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">🚗 Choose Transportation Mode</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {transportationModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleTravelModeChange(mode.id as any)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    travelMode === mode.id
                      ? `border-indigo-500 ${mode.color} text-white shadow-lg transform scale-105`
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <mode.icon className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-semibold">{mode.name}</div>
                      <div className="text-xs opacity-80">{mode.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Trip Destination Display */}
            {tripData && destination && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">🎯 Trip Destination:</h4>
                <p className="text-sm text-blue-700 font-medium">{destination.name}</p>
                <p className="text-xs text-blue-600 mt-1">
                  Coordinates: {destination.lat.toFixed(6)}, {destination.lng.toFixed(6)}
                </p>
                <p className="text-xs text-blue-600">
                  Dates: {new Date(tripData.startDate).toLocaleDateString()} - {new Date(tripData.endDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Navigation Controls
              </h4>
              
              {!isManualTracking ? (
                <button
                  onClick={startManualNavigation}
                  disabled={!currentLocation || !destination || isGPSTracking}
                  className="w-full flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start {getTravelModeIcon(travelMode)} {travelMode.toUpperCase()} Navigation
                </button>
              ) : (
                <button
                  onClick={stopManualNavigation}
                  className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Navigation
                </button>
              )}
              
              <p className="text-xs text-orange-600 mt-2">
                {isManualTracking 
                  ? `🎯 ${travelMode.toUpperCase()} navigation active from ${currentLocation?.name} to ${destination?.name}`
                  : `Set your starting location and select travel mode to begin navigation`
                }
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Route Information Panel */}
      {routeData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <MapIcon className="w-6 h-6 text-indigo-600 mr-2" />
            {getTravelModeIcon(routeData.travelMode)} Route: {currentLocation?.name} → {destination?.name}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{routeData.distance}</div>
              <div className="text-sm text-blue-800">Distance</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{routeData.duration}</div>
              <div className="text-sm text-green-800">Normal Time</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{routeData.durationInTraffic}</div>
              <div className="text-sm text-orange-800">With Traffic</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold">
                <span className={getTrafficColor(routeData.trafficCondition)}>
                  {getTrafficIcon(routeData.trafficCondition)} {routeData.trafficCondition.toUpperCase()}
                </span>
              </div>
              <div className="text-sm text-gray-800">Traffic Condition</div>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-4">
            <button
              onClick={refreshRoute}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Route
            </button>
            <button
              onClick={toggleTraffic}
              className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Toggle Traffic Layer
            </button>
            <button
              onClick={centerMapOnRoute}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <MapIcon className="w-4 h-4 mr-2" />
              Show Full Route
            </button>
          </div>
        </motion.div>
      )}

      {/* Map Error Alert */}
      {mapError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <h3 className="font-medium text-red-800">Navigation Error</h3>
              <p className="text-sm text-red-600 mt-1">{mapError}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Google Maps Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden relative"
        style={{ height: '650px' }}
      >
        {isMapLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 z-10">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-800 mb-2">Loading Smart Navigation...</p>
              <p className="text-sm text-gray-600">Getting ready for location-based routing</p>
            </div>
          </div>
        )}
        
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        
        {/* Map Controls */}
        {!isMapLoading && !mapError && (
          <div className="absolute top-4 right-4 space-y-2">
            <button
              onClick={centerMapOnUser}
              disabled={!currentLocation}
              className="block w-full bg-white text-gray-700 px-3 py-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
            >
              📍 My Location
            </button>
            <button
              onClick={centerMapOnRoute}
              disabled={!routeData}
              className="block w-full bg-white text-gray-700 px-3 py-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
            >
              🗺️ Full Route
            </button>
            <button
              onClick={toggleGPSTracking}
              disabled={!!mapError}
              className={`block w-full px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors ${
                isGPSTracking 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              } ${mapError ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isGPSTracking ? '⏹️ Stop GPS' : '🛰️ Start GPS'}
            </button>
          </div>
        )}

        {/* Route Legend */}
        {routeData && !isMapLoading && (
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
            <div className="text-xs space-y-1">
              <div className="flex items-center">
                <div className={`w-4 h-1 rounded mr-2`} style={{backgroundColor: getTravelModeColor(travelMode)}}></div>
                <span>{getTravelModeIcon(travelMode)} {travelMode.toUpperCase()} Route</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-1 bg-green-500 rounded mr-2" style={{background: 'repeating-linear-gradient(to right, #34A853 0, #34A853 4px, transparent 4px, transparent 8px)'}}></div>
                <span>Alternate Route</span>
              </div>
              {travelMode === 'driving' && (
                <div className="flex items-center text-gray-600">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span>Traffic Layer</span>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Status Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Current Status */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Status</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className={getTrackingColor()}>
                {currentLocation ? '📍 Set' : '❌ Not Set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Navigation:</span>
              <span className={getTrackingColor()}>
                {getTrackingStatus()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Travel Mode:</span>
              <span className="font-medium">
                {getTravelModeIcon(travelMode)} {travelMode.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Route:</span>
              <span className={routeData ? 'text-green-600' : 'text-gray-600'}>
                {routeData ? '🗺️ Active' : '⏳ Waiting'}
              </span>
            </div>
          </div>
        </div>

        {/* Trip Info */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Trip Information</h3>
          {tripData && destination ? (
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Destination:</span>
                <p className="font-medium text-indigo-600">{destination.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Trip Dates:</span>
                <p className="font-medium">{new Date(tripData.startDate).toLocaleDateString()} - {new Date(tripData.endDate).toLocaleDateString()}</p>
              </div>
              {currentLocation && (
                <div>
                  <span className="text-gray-600">From:</span>
                  <p className="font-medium text-green-600">{currentLocation.name}</p>
                </div>
              )}
              {routeData && (
                <div>
                  <span className="text-gray-600">Route Status:</span>
                  <p className="font-medium text-blue-600">📍 {routeData.distance} • {routeData.durationInTraffic}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No trip data available</p>
              <button
                onClick={() => navigate('/trip-planner')}
                className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm underline"
              >
                Plan a new trip
              </button>
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">API Status:</span>
              <span className="text-green-600 font-medium">✅ Ready</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Connection:</span>
              <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? '🟢 Online' : '🔴 Offline'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">GPS Available:</span>
              <span className={navigator.geolocation ? 'text-green-600' : 'text-red-600'}>
                {navigator.geolocation ? '🛰️ Yes' : '❌ No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Geocoding:</span>
              <span className="text-green-600">🔍 Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monitoring:</span>
              <span className={isMonitoringTraffic ? 'text-green-600' : 'text-gray-600'}>
                {isMonitoringTraffic ? '🚦 Active' : '⏸️ Inactive'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RealTimeMap;
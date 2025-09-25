import React, { useState } from 'react';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { apiService } from '../services/apiService';
import { X, Star, MapPin, Wifi, Car, Coffee, Dumbbell, Utensils } from 'lucide-react';

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  price: number;
  originalPrice: number;
  availableSeats: number;
  class: string;
  amenities: {
    meals: boolean;
    wifi: boolean;
    entertainment: boolean;
    powerOutlets: boolean;
  };
}

interface Hotel {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  price: number;
  totalPrice: number;
  images: string[];
  amenities: string[];
  roomType: string;
  cancellation: {
    free: boolean;
    deadline: string;
  };
}

/* -------- Utilities -------- */

// Parse "6h 30m" into total minutes for correct duration sorting
const durationToMinutes = (s: string) => {
  const h = s.match(/(\d+)\s*h/i)?.[1];
  const m = s.match(/(\d+)\s*m/i)?.[1];
  const hours = h ? parseInt(h, 10) : 0;
  const mins = m ? parseInt(m, 10) : 0;
  return hours * 60 + mins;
};

// Local mock images to use if hotel.images is missing/empty/broken (place these assets in public/images/hotels/)
const MOCK_HOTEL_IMAGES = [
  '/images/hotels/placeholder-1.jpg',
  '/images/hotels/placeholder-2.jpg',
  '/images/hotels/placeholder-3.jpg',
  '/images/hotels/placeholder-4.jpg',
];

// Choose usable image URLs with fallback to mocks
const getHotelImageUrls = (images?: string[]) => {
  const valid = (images || []).filter(Boolean);
  return valid.length ? valid : MOCK_HOTEL_IMAGES;
};

/* -------- Image & Modal Components -------- */

const HotelImage: React.FC<{ images: string[]; name: string; className?: string }> = ({ images, name, className = 'w-full h-full object-cover' }) => {
  const urls = getHotelImageUrls(images);
  const [index, setIndex] = useState(0);
  const [broken, setBroken] = useState(false);
  const src = broken ? '/images/hotels/placeholder-1.jpg' : urls[index];

  return (
    <div className="relative w-full h-full group">
      <img
        src={src}
        alt={`${name} photo`}
        className={className}
        loading="lazy"
        decoding="async"
        onError={() => setBroken(true)}
      />
      {urls.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setBroken(false);
              setIndex((i) => (i - 1 + urls.length) % urls.length);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setBroken(false);
              setIndex((i) => (i + 1) % urls.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {urls.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setBroken(false);
                  setIndex(i);
                }}
                className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const HotelDetailModal: React.FC<{
  hotel: Hotel | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (hotel: Hotel) => void;
}> = ({ hotel, isOpen, onClose, onBook }) => {
  if (!isOpen || !hotel) return null;

  const iconForAmenity = (a: string) => {
    const s = a.toLowerCase();
    if (s.includes('wifi') || s.includes('internet')) return <Wifi className="w-4 h-4" />;
    if (s.includes('parking') || s.includes('car')) return <Car className="w-4 h-4" />;
    if (s.includes('gym') || s.includes('fitness')) return <Dumbbell className="w-4 h-4" />;
    if (s.includes('breakfast') || s.includes('restaurant')) return <Utensils className="w-4 h-4" />;
    if (s.includes('coffee')) return <Coffee className="w-4 h-4" />;
    return <span className="w-4 h-4 text-center">•</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative h-80">
          <HotelImage images={hotel.images} name={hotel.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h2 className="text-3xl font-bold text-white mb-2">{hotel.name}</h2>
            <div className="flex items-center text-white/90 text-lg">
              <MapPin className="w-5 h-5 mr-2" />
              {hotel.address}
            </div>
          </div>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-yellow-100 px-3 py-2 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-500 mr-1" />
                  <span className="font-semibold text-yellow-700">{hotel.rating}</span>
                </div>
                <span className="text-gray-600">({hotel.reviewCount} reviews)</span>
                <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{hotel.roomType}</div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {hotel.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center space-x-2 text-sm text-gray-700">
                      {iconForAmenity(amenity)}
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {hotel.cancellation.free && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-green-700 font-medium">✅ Free Cancellation</div>
                  <div className="text-sm text-green-600 mt-1">
                    Cancel until {hotel.cancellation.deadline} at no charge
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">${hotel.price}</div>
                <div className="text-sm text-gray-600 mb-4">per night</div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Total stay:</span>
                    <span className="font-medium">${hotel.totalPrice}</span>
                  </div>
                  <div className="text-xs text-gray-500">Includes taxes and fees</div>
                </div>
                <Button
                  onClick={() => {
                    onBook(hotel);
                    onClose();
                  }}
                  className="w-full mt-4"
                >
                  Book Now
                </Button>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>• Instant booking confirmation</div>
                <div>• Secure payment processing</div>
                <div>• 24/7 customer support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------- Page Component -------- */

const BookingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels'>('flights');
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [hotelsLoading, setHotelsLoading] = useState(false);

  // Flight search state
  const [flightSearch, setFlightSearch] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: '1',
    class: 'economy',
  });
  const [flights, setFlights] = useState<Flight[]>([]);
  const [flightFilters, setFlightFilters] = useState({
    maxPrice: '',
    stops: '',
    airlines: '',
    sortBy: 'price',
  });

  // Hotel search state
  const [hotelSearch, setHotelSearch] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: '2',
    rooms: '1',
  });
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelFilters, setHotelFilters] = useState({
    maxPrice: '',
    minRating: '',
    amenities: '',
    sortBy: 'rating',
  });

  // Modal state
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showHotelModal, setShowHotelModal] = useState(false);

  const searchFlights = async () => {
    setFlightsLoading(true);
    try {
      const response = await apiService.post<{ flights: Flight[] }>('/booking/flights/search', flightSearch);
      if (response.success && response.data) setFlights(response.data.flights);
    } catch (e) {
      console.error('Flight search failed:', e);
    } finally {
      setFlightsLoading(false);
    }
  };

  const searchHotels = async () => {
    setHotelsLoading(true);
    try {
      const response = await apiService.post<{ hotels: Hotel[] }>('/booking/hotels/search', hotelSearch);
      if (response.success && response.data) setHotels(response.data.hotels);
    } catch (e) {
      console.error('Hotel search failed:', e);
    } finally {
      setHotelsLoading(false);
    }
  };

  const bookFlight = async (flight: Flight) => {
    try {
      const passengerInfo = Array.from({ length: parseInt(flightSearch.passengers, 10) }, (_, i) => ({
        firstName: 'Passenger',
        lastName: `Passenger ${i + 1}`,
        email: 'user@example.com',
        phone: '+1234567890',
      }));
      const response = await apiService.post('/booking/flights/book', {
        flightId: flight.id,
        passengerInfo,
        contactInfo: { email: 'user@example.com', phone: '+1234567890' },
        paymentInfo: { method: 'credit_card', cardNumber: '**** **** **** 1234' },
      });
      if (response.success) {
        const data = response.data as { confirmationNumber: string };
        alert(`Flight booked successfully! Confirmation: ${data.confirmationNumber}`);
      }
    } catch (e) {
      console.error('Flight booking failed:', e);
      alert('Flight booking failed. Please try again.');
    }
  };

  const bookHotel = async (hotel: Hotel) => {
    try {
      const response = await apiService.post('/booking/hotels/book', {
        hotelId: hotel.id,
        guestInfo: {
          checkIn: hotelSearch.checkIn,
          checkOut: hotelSearch.checkOut,
          guests: parseInt(hotelSearch.guests, 10),
          rooms: parseInt(hotelSearch.rooms, 10),
        },
        contactInfo: { email: 'user@example.com', phone: '+1234567890' },
        paymentInfo: { method: 'credit_card', cardNumber: '**** **** **** 1234' },
      });
      if (response.success) {
        const data = response.data as { confirmationNumber: string };
        alert(`Hotel booked successfully! Confirmation: ${data.confirmationNumber}`);
      }
    } catch (e) {
      console.error('Hotel booking failed:', e);
      alert('Hotel booking failed. Please try again.');
    }
  };

  const openHotelModal = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setShowHotelModal(true);
  };

  const closeHotelModal = () => {
    setShowHotelModal(false);
    setSelectedHotel(null);
  };

  // Flights filter + sort
  const filteredFlights = flights
    .filter((f) => {
      if (flightFilters.maxPrice && f.price > parseInt(flightFilters.maxPrice, 10)) return false;
      if (flightFilters.stops) {
        if (flightFilters.stops === '0' && f.stops !== 0) return false;
        if (flightFilters.stops === '1' && f.stops !== 1) return false;
        if (flightFilters.stops === '2' && f.stops < 2) return false; // 2+ stops
      }
      if (flightFilters.airlines) {
        const sel = flightFilters.airlines
          .toLowerCase()
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean);
        if (sel.length && !sel.some((a) => f.airline.toLowerCase().includes(a))) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (flightFilters.sortBy === 'price') return a.price - b.price;
      if (flightFilters.sortBy === 'duration') return durationToMinutes(a.duration) - durationToMinutes(b.duration);
      return 0;
    });

  // Hotels filter + sort
  const filteredHotels = hotels
    .filter((h) => {
      if (hotelFilters.maxPrice && h.price > parseInt(hotelFilters.maxPrice, 10)) return false;
      if (hotelFilters.minRating && h.rating < parseFloat(hotelFilters.minRating)) return false;
      if (hotelFilters.amenities) {
        const wants = hotelFilters.amenities
          .toLowerCase()
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean);
        if (wants.length && !wants.every((w) => h.amenities.some((x) => x.toLowerCase().includes(w)))) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (hotelFilters.sortBy === 'price') return a.price - b.price;
      if (hotelFilters.sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="container-custom py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">🛫 Book Your Travel</h1>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('flights')}
            className={`flex-1 py-3 px-6 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'flights' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ✈ Flights
          </button>
          <button
            onClick={() => setActiveTab('hotels')}
            className={`flex-1 py-3 px-6 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'hotels' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏨 Hotels
          </button>
        </div>

        {/* Flights */}
        {activeTab === 'flights' && (
          <div className="space-y-8">
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-6">Search Flights</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <InputField label="From" value={flightSearch.origin} onChange={(e) => setFlightSearch((p) => ({ ...p, origin: e.target.value }))} placeholder="Origin city" />
                <InputField label="To" value={flightSearch.destination} onChange={(e) => setFlightSearch((p) => ({ ...p, destination: e.target.value }))} placeholder="Destination city" />
                <InputField label="Departure" type="date" value={flightSearch.departureDate} onChange={(e) => setFlightSearch((p) => ({ ...p, departureDate: e.target.value }))} />
                <InputField label="Return (Optional)" type="date" value={flightSearch.returnDate} onChange={(e) => setFlightSearch((p) => ({ ...p, returnDate: e.target.value }))} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                  <select value={flightSearch.passengers} onChange={(e) => setFlightSearch((p) => ({ ...p, passengers: e.target.value }))} className="input-field">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n.toString()}>
                        {n} Passenger{n > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <select value={flightSearch.class} onChange={(e) => setFlightSearch((p) => ({ ...p, class: e.target.value }))} className="input-field">
                    <option value="economy">Economy</option>
                    <option value="premium">Premium Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First Class</option>
                  </select>
                </div>
              </div>

              <Button onClick={searchFlights} loading={flightsLoading} disabled={!flightSearch.origin || !flightSearch.destination || !flightSearch.departureDate} className="w-full md:w-auto">
                Search Flights
              </Button>
            </div>

            {flights.length > 0 && (
              <div className="card p-4">
                <h3 className="font-semibold mb-4">Filter Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <InputField label="Max Price" type="number" value={flightFilters.maxPrice} onChange={(e) => setFlightFilters((p) => ({ ...p, maxPrice: e.target.value }))} placeholder="Max price" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stops</label>
                    <select value={flightFilters.stops} onChange={(e) => setFlightFilters((p) => ({ ...p, stops: e.target.value }))} className="input-field">
                      <option value="">Any</option>
                      <option value="0">Direct</option>
                      <option value="1">1 Stop</option>
                      <option value="2">2+ Stops</option>
                    </select>
                  </div>
                  <InputField label="Airlines" value={flightFilters.airlines} onChange={(e) => setFlightFilters((p) => ({ ...p, airlines: e.target.value }))} placeholder="e.g., Air India, Indigo" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select value={flightFilters.sortBy} onChange={(e) => setFlightFilters((p) => ({ ...p, sortBy: e.target.value }))} className="input-field">
                      <option value="price">Price (Low to High)</option>
                      <option value="duration">Duration (Shortest)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {filteredFlights.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">{filteredFlights.length} Flight{filteredFlights.length > 1 ? 's' : ''} Found</h3>
                {filteredFlights.map((f) => (
                  <div key={f.id} className="card p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="font-semibold text-lg">{f.airline}</div>
                          <div className="text-sm text-gray-500">{f.flightNumber}</div>
                          <div className="text-sm bg-gray-100 px-2 py-1 rounded">{f.class.toUpperCase()}</div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <div className="text-sm text-gray-500">Departure</div>
                            <div className="font-medium">{f.departureTime}</div>
                            <div className="text-sm text-gray-600">{f.origin}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500">{f.duration}</div>
                            <div className="border-t-2 border-gray-300 my-1 relative">
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-gray-400">✈</div>
                            </div>
                            <div className="text-sm text-gray-600">{f.stops === 0 ? 'Direct' : `${f.stops} stop${f.stops > 1 ? 's' : ''}`}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Arrival</div>
                            <div className="font-medium">{f.arrivalTime}</div>
                            <div className="text-sm text-gray-600">{f.destination}</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs">
                          {f.amenities.meals && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">🍽 Meals</span>}
                          {f.amenities.wifi && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">📶 WiFi</span>}
                          {f.amenities.entertainment && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">🎬 Entertainment</span>}
                          {f.amenities.powerOutlets && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">🔌 Power</span>}
                        </div>
                      </div>

                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-primary-600">${f.price}</div>
                        {f.originalPrice > f.price && <div className="text-sm text-gray-500 line-through">${f.originalPrice}</div>}
                        <div className="text-sm text-gray-600 mb-3">{f.availableSeats} seats left</div>
                        <Button onClick={() => bookFlight(f)} className="w-24" disabled={f.availableSeats <= 0}>
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hotels */}
        {activeTab === 'hotels' && (
          <div className="space-y-8">
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-6">Search Hotels</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <InputField label="Destination" value={hotelSearch.destination} onChange={(e) => setHotelSearch((p) => ({ ...p, destination: e.target.value }))} placeholder="City or hotel name" />
                <InputField label="Check-in" type="date" value={hotelSearch.checkIn} onChange={(e) => setHotelSearch((p) => ({ ...p, checkIn: e.target.value }))} />
                <InputField label="Check-out" type="date" value={hotelSearch.checkOut} onChange={(e) => setHotelSearch((p) => ({ ...p, checkOut: e.target.value }))} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Guests</label>
                  <select value={hotelSearch.guests} onChange={(e) => setHotelSearch((p) => ({ ...p, guests: e.target.value }))} className="input-field">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n.toString()}>
                        {n} Guest{n > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rooms</label>
                  <select value={hotelSearch.rooms} onChange={(e) => setHotelSearch((p) => ({ ...p, rooms: e.target.value }))} className="input-field">
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n.toString()}>
                        {n} Room{n > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button onClick={searchHotels} loading={hotelsLoading} disabled={!hotelSearch.destination || !hotelSearch.checkIn || !hotelSearch.checkOut} className="w-full md:w-auto">
                Search Hotels
              </Button>
            </div>

            {hotels.length > 0 && (
              <div className="card p-4">
                <h3 className="font-semibold mb-4">Filter Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <InputField label="Max Price" type="number" value={hotelFilters.maxPrice} onChange={(e) => setHotelFilters((p) => ({ ...p, maxPrice: e.target.value }))} placeholder="Max price per night" />
                  <InputField label="Min Rating" type="number" step="0.1" min="0" max="5" value={hotelFilters.minRating} onChange={(e) => setHotelFilters((p) => ({ ...p, minRating: e.target.value }))} placeholder="Min rating (0-5)" />
                  <InputField label="Amenities" value={hotelFilters.amenities} onChange={(e) => setHotelFilters((p) => ({ ...p, amenities: e.target.value }))} placeholder="e.g., wifi, parking, gym" />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select value={hotelFilters.sortBy} onChange={(e) => setHotelFilters((p) => ({ ...p, sortBy: e.target.value }))} className="input-field">
                      <option value="rating">Rating (High to Low)</option>
                      <option value="price">Price (Low to High)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {filteredHotels.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">{filteredHotels.length} Hotel{filteredHotels.length > 1 ? 's' : ''} Found</h3>
                {filteredHotels.map((h) => (
                  <div key={h.id} className="card overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => openHotelModal(h)}>
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        <HotelImage images={h.images} name={h.name} className="w-full h-48 md:h-full object-cover" />
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">{h.name}</h3>
                            <p className="text-gray-600 mb-2 flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {h.address}
                            </p>
                            <div className="flex items-center space-x-4 mb-3">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(h.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                ))}
                                <span className="ml-1 text-sm text-gray-600">
                                  {h.rating} ({h.reviewCount} reviews)
                                </span>
                              </div>
                            </div>

                            <div className="mb-3">
                              <div className="text-sm text-gray-600 mb-1">Room: {h.roomType}</div>
                              <div className="flex flex-wrap gap-1">
                                {h.amenities.slice(0, 4).map((a, i) => (
                                  <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    {a}
                                  </span>
                                ))}
                                {h.amenities.length > 4 && (
                                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">+{h.amenities.length - 4} more</span>
                                )}
                              </div>
                            </div>

                            {h.cancellation.free && <div className="text-sm text-green-600 mb-2">✅ Free cancellation until {h.cancellation.deadline}</div>}
                          </div>

                          <div className="text-right ml-6">
                            <div className="text-2xl font-bold text-primary-600">${h.price}</div>
                            <div className="text-sm text-gray-600 mb-1">per night</div>
                            <div className="text-sm text-gray-500 mb-3">Total: ${h.totalPrice}</div>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                bookHotel(h);
                              }}
                              className="w-24"
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No Results */}
        {((activeTab === 'flights' && flights.length === 0 && !flightsLoading) ||
          (activeTab === 'hotels' && hotels.length === 0 && !hotelsLoading)) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{activeTab === 'flights' ? '✈' : '🏨'}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'flights' ? 'No flights found' : 'No hotels found'}
            </h3>
            <p className="text-gray-600">Try adjusting your search criteria or dates</p>
          </div>
        )}
      </div>

      <HotelDetailModal hotel={selectedHotel} isOpen={showHotelModal} onClose={closeHotelModal} onBook={bookHotel} />
    </div>
  );
};

export default BookingPage;
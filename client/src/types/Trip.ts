export interface Trip {
  id: string;
  userId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  duration: number;
  budget: {
    total: number;
    currency: 'INR'; // Set to Indian Rupees
    breakdown: {
      accommodation: number;
      food: number;
      transport: number;
      activities: number;
      shopping: number;
      emergency: number;
    };
  };
  travelers: {
    adults: number;
    children: number;
    infants: number;
  };
  preferences: {
    travelStyle: 'budget' | 'mid-range' | 'luxury';
    interests: string[];
    accessibility: boolean;
    dietaryRestrictions: string[];
  };
  itinerary: DayPlan[];
  accommodations: Accommodation[];
  transportation: Transportation[];
  photos: TripPhoto[];
  weather: WeatherForecast[];
  alerts: TripAlert[];
  collaborators: string[];
  status: 'draft' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  aiGenerated: boolean;
  backupPlans: BackupPlan[];
}

export interface DayPlan {
  day: number;
  date: string;
  theme?: string;
  activities: Activity[];
  meals: Meal[];
  accommodation: string;
  transportation: DayTransport[];
  budget: number;
  weather: DailyWeather;
  emergencyContacts: EmergencyContact[];
  photos: string[];
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  location: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  startTime: string;
  endTime: string;
  duration: number;
  cost: {
    amount: number;
    currency: 'INR'; // Set to Indian Rupees
    includes: string[];
  };
  category: 'sightseeing' | 'adventure' | 'cultural' | 'relaxation' | 'food' | 'shopping' | 'entertainment';
  difficultyLevel: 'easy' | 'moderate' | 'challenging';
  photos: string[];
  reviews: {
    rating: number;
    count: number;
    highlights: string[];
  };
  bookingInfo: {
    required: boolean;
    url?: string;
    contact?: string;
  };
  accessibility: {
    wheelchairAccessible: boolean;
    visuallyImpairedFriendly: boolean;
    hearingImpairedFriendly: boolean;
  };
  alternatives: Activity[];
}

export interface TripPhoto {
  id: string;
  url: string;
  thumbnail: string;
  caption: string;
  location: string;
  dayNumber: number;
  activityId?: string;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
  isPublic: boolean;
}

export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
    unit: 'C' | 'F';
  };
  condition: string;
  precipitation: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  recommendations: string[];
}

export interface TripAlert {
  id: string;
  type: 'weather' | 'safety' | 'transportation' | 'activity' | 'health' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionRequired: boolean;
  suggestedActions: string[];
  expiresAt?: string;
  createdAt: string;
}

export interface BackupPlan {
  id: string;
  reason: string;
  alternatives: {
    activities: Activity[];
    accommodation?: Accommodation;
    transportation?: Transportation;
  };
  cost: number;
}

export interface Accommodation {
  id: string;
  name: string;
  type: 'hotel' | 'hostel' | 'apartment' | 'resort' | 'guesthouse';
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  checkIn: string;
  checkOut: string;
  pricePerNight: number;
  currency: 'INR';
  amenities: string[];
  rating: number;
  photos: string[];
  bookingUrl?: string;
}

export interface Transportation {
  id: string;
  type: 'flight' | 'train' | 'bus' | 'car' | 'taxi' | 'metro';
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  cost: number;
  currency: 'INR';
  provider: string;
  bookingReference?: string;
  seatNumber?: string;
}

export interface Meal {
  id: string;
  name: string;
  restaurant: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string;
  cost: number;
  currency: 'INR';
  cuisine: string;
  dietaryInfo: string[];
  location: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

export interface DayTransport {
  id: string;
  type: 'walk' | 'taxi' | 'bus' | 'metro' | 'auto';
  from: string;
  to: string;
  duration: number;
  cost: number;
  currency: 'INR';
  notes?: string;
}

export interface DailyWeather {
  date: string;
  temperature: {
    min: number;
    max: number;
    unit: 'C';
  };
  condition: string;
  precipitation: number;
  humidity: number;
  recommendations: string[];
}

export interface EmergencyContact {
  name: string;
  phone: string;
  type: 'police' | 'hospital' | 'embassy' | 'local-contact';
  address?: string;
}

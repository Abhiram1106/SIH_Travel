// User types
export interface User {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePicture?: string;
  phoneNumber?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'traveler' | 'admin' | 'vendor' | 'guide' | 'support';

export interface UserPreferences {
  preferredLanguage: string;
  currency: string;
  budgetRange: {
    min: number;
    max: number;
  };
  travelInterests: string[];
  dietaryRestrictions: string[];
  accessibility: string[];
}

// Travel types
export interface Trip {
  _id: string;
  userId: string;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  itinerary: ItineraryItem[];
  expenses: Expense[];
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ItineraryItem {
  _id: string;
  day: number;
  time: string;
  activity: string;
  location: string;
  description?: string;
  cost: number;
  bookingInfo?: BookingInfo;
}

export interface BookingInfo {
  type: 'flight' | 'hotel' | 'activity' | 'restaurant';
  confirmationNumber?: string;
  provider: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface Expense {
  _id: string;
  category: string;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  receipt?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: DailyForecast[];
}

export interface DailyForecast {
  date: Date;
  high: number;
  low: number;
  condition: string;
}

// Recommendation types
export interface TravelRecommendation {
  _id: string;
  destination: string;
  type: 'hotel' | 'restaurant' | 'activity' | 'attraction';
  name: string;
  description: string;
  rating: number;
  priceRange: string;
  images: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  aiScore: number;
  reasons: string[];
}
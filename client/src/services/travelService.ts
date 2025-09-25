import { apiService } from './apiService';
import { Trip, TravelRecommendation, WeatherData } from '../types';

class TravelService {
  // Trip management
  async getTrips(): Promise<Trip[]> {
    const response = await apiService.get<Trip[]>('/trips');
    return response.data || [];
  }

  async getTrip(id: string): Promise<Trip> {
    const response = await apiService.get<Trip>(`/trips/${id}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch trip');
  }

  async createTrip(tripData: Partial<Trip>): Promise<Trip> {
    const response = await apiService.post<Trip>('/trips', tripData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to create trip');
  }

  async updateTrip(id: string, tripData: Partial<Trip>): Promise<Trip> {
    const response = await apiService.put<Trip>(`/trips/${id}`, tripData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update trip');
  }

  async deleteTrip(id: string): Promise<void> {
    const response = await apiService.delete(`/trips/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete trip');
    }
  }

  // AI Recommendations
  async getRecommendations(destination: string, preferences?: any): Promise<TravelRecommendation[]> {
    const response = await apiService.post<TravelRecommendation[]>('/ai/recommendations', {
      destination,
      preferences
    });
    return response.data || [];
  }

  async generateItinerary(tripData: any): Promise<any> {
    const response = await apiService.post('/ai/generate-itinerary', tripData);
    return response.data;
  }

  // Weather service
  async getWeather(location: string): Promise<WeatherData> {
    const response = await apiService.get<WeatherData>(`/weather/${encodeURIComponent(location)}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch weather data');
  }

  // Currency conversion
  async convertCurrency(from: string, to: string, amount: number): Promise<number> {
    const response = await apiService.get<{ rate: number; convertedAmount: number }>(
      `/currency/convert?from=${from}&to=${to}&amount=${amount}`
    );
    if (response.success && response.data) {
      return response.data.convertedAmount;
    }
    throw new Error(response.message || 'Currency conversion failed');
  }

  // Booking services
  async searchFlights(searchData: any): Promise<any[]> {
    const response = await apiService.post<any[]>('/booking/flights/search', searchData);
    return response.data || [];
  }

  async searchHotels(searchData: any): Promise<any[]> {
    const response = await apiService.post<any[]>('/booking/hotels/search', searchData);
    return response.data || [];
  }

  async bookFlight(bookingData: any): Promise<any> {
    const response = await apiService.post('/booking/flights/book', bookingData);
    return response.data;
  }

  async bookHotel(bookingData: any): Promise<any> {
    const response = await apiService.post('/booking/hotels/book', bookingData);
    return response.data;
  }
}

export const travelService = new TravelService();
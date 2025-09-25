const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async getWeatherForecast(lat, lon, days = 7) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
          cnt: days * 8 // 8 forecasts per day (3-hour intervals)
        }
      });
      return this.processWeatherData(response.data);
    } catch (error) {
      throw new Error(`Weather API error: ${error.message}`);
    }
  }

  async checkWeatherAlerts(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric'
        }
      });
      
      return this.analyzeWeatherForTravel(response.data);
    } catch (error) {
      throw new Error(`Weather alert check failed: ${error.message}`);
    }
  }

  processWeatherData(data) {
    return data.list.map(item => ({
      date: new Date(item.dt * 1000),
      temperature: {
        current: item.main.temp,
        min: item.main.temp_min,
        max: item.main.temp_max
      },
      condition: item.weather.main,
      description: item.weather.description,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed,
      precipitation: item.rain ? item.rain['3h'] : 0
    }));
  }

  analyzeWeatherForTravel(weatherData) {
    const alerts = [];
    const temp = weatherData.main.temp;
    const condition = weatherData.weather.main;
    
    if (temp < 0) {
      alerts.push({
        type: 'extreme_cold',
        message: 'Extremely cold weather expected. Pack warm clothing.',
        severity: 'high'
      });
    }
    
    if (temp > 40) {
      alerts.push({
        type: 'extreme_heat',
        message: 'Extremely hot weather expected. Stay hydrated.',
        severity: 'high'
      });
    }
    
    if (['Thunderstorm', 'Snow', 'Rain'].includes(condition)) {
      alerts.push({
        type: 'severe_weather',
        message: `${condition} expected. Consider indoor activities.`,
        severity: 'medium'
      });
    }
    
    return {
      isSafe: alerts.length === 0,
      alerts,
      recommendation: this.getWeatherRecommendation(weatherData)
    };
  }

  getWeatherRecommendation(weatherData) {
    const temp = weatherData.main.temp;
    const condition = weatherData.weather.main;
    
    if (temp >= 20 && temp <= 30 && condition === 'Clear') {
      return 'Perfect weather for outdoor activities!';
    } else if (temp < 10 || ['Rain', 'Snow'].includes(condition)) {
      return 'Consider indoor attractions and museums.';
    } else {
      return 'Mixed conditions. Plan both indoor and outdoor activities.';
    }
  }
}

module.exports = new WeatherService();
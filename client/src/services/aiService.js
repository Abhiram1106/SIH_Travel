const axios = require('axios');

class AIService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.baseUrl = 'https://api.openai.com/v1';
  }

  async generateItinerary(destination, days, budget, preferences, weatherData, securityData) {
    const prompt = this.buildItineraryPrompt(destination, days, budget, preferences, weatherData, securityData);
    
    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert travel planner AI that creates detailed, personalized itineraries based on weather conditions, safety considerations, and user preferences.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return this.parseItineraryResponse(response.data.choices.message.content);
    } catch (error) {
      throw new Error(`AI Service error: ${error.message}`);
    }
  }

  buildItineraryPrompt(destination, days, budget, preferences, weatherData, securityData) {
    return `Create a ${days}-day travel itinerary for ${destination} with the following constraints:

Budget: $${budget}
Travel Style: ${preferences.travelStyle}
Accommodation Preference: ${preferences.accommodation}

Weather Conditions:
${weatherData.alerts.map(alert => `- ${alert.message}`).join('\n')}

Security Information:
- Risk Level: ${securityData.riskLevel}
- ${securityData.recommendation}

Requirements:
1. Provide day-by-day activities with specific times
2. Include indoor alternatives for bad weather days
3. Consider security recommendations
4. Suggest appropriate restaurants for each meal
5. Include travel time between locations
6. Recommend suitable accommodation options
7. Stay within the specified budget

Format the response as a structured JSON object with the following structure:
{
  "summary": "Brief overview of the trip",
  "dailyItinerary": [
    {
      "day": 1,
      "theme": "Arrival and City Overview",
      "activities": [
        {
          "time": "09:00",
          "activity": "Activity name",
          "location": "Specific location",
          "duration": 120,
          "description": "Detailed description",
          "type": "sightseeing|dining|transportation|accommodation",
          "estimatedCost": 25,
          "weatherDependent": false
        }
      ]
    }
  ],
  "accommodationRecommendations": [
    {
      "name": "Hotel name",
      "pricePerNight": 120,
      "location": "Area",
      "amenities": ["wifi", "breakfast"],
      "rating": 4.2
    }
  ],
  "totalEstimatedCost": 850,
  "packingRecommendations": ["item1", "item2"],
  "safetyTips": ["tip1", "tip2"]
}`;
  }

  parseItineraryResponse(response) {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      return JSON.parse(jsonMatch);
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  async suggestAlternativeDestination(originalDestination, budget, country, reason) {
    const prompt = `The originally planned destination "${originalDestination}" is not suitable for travel due to: ${reason}

Please suggest 3 alternative destinations in ${country} that would be suitable for a $${budget} budget trip. 

Provide the response as a JSON array with the following structure:
[
  {
    "name": "City name",
    "description": "Why this is a good alternative",
    "estimatedBudget": 800,
    "highlights": ["attraction1", "attraction2", "attraction3"],
    "bestTimeToVisit": "Season/months"
  }
]`;

    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a travel expert that suggests alternative destinations based on safety and weather conditions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const jsonMatch = response.data.choices.message.content.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch) : [];
    } catch (error) {
      throw new Error(`Alternative destination suggestion failed: ${error.message}`);
    }
  }
}

module.exports = new AIService();
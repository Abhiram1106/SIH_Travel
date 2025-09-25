const axios = require('axios');

class SecurityService {
  constructor() {
    this.risklineApiKey = process.env.RISKLINE_API_KEY;
    this.baseUrl = 'https://api.riskline.com';
  }

  async checkSecurityThreats(country, city) {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/alerts`, {
        headers: {
          'Authorization': `Bearer ${this.risklineApiKey}`
        },
        params: {
          country,
          city,
          category: 'security,terrorism,civil_unrest'
        }
      });
      
      return this.processSecurityData(response.data);
    } catch (error) {
      console.error('Security API error:', error.message);
      return this.getFallbackSecurityData();
    }
  }

  processSecurityData(data) {
    const alerts = data.alerts || [];
    const highRiskAlerts = alerts.filter(alert => 
      ['high', 'critical'].includes(alert.severity)
    );
    
    return {
      riskLevel: this.calculateRiskLevel(alerts),
      alerts: alerts.map(alert => ({
        type: alert.category,
        message: alert.description,
        severity: alert.severity,
        date: new Date(alert.created_at)
      })),
      isSafe: highRiskAlerts.length === 0,
      recommendation: this.getSecurityRecommendation(alerts)
    };
  }

  calculateRiskLevel(alerts) {
    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    const highCount = alerts.filter(a => a.severity === 'high').length;
    
    if (criticalCount > 0) return 'high';
    if (highCount > 2) return 'high';
    if (highCount > 0) return 'medium';
    return 'low';
  }

  getSecurityRecommendation(alerts) {
    const highRiskAlerts = alerts.filter(alert => 
      ['high', 'critical'].includes(alert.severity)
    );
    
    if (highRiskAlerts.length > 0) {
      return 'Consider alternative destinations due to security concerns.';
    }
    return 'Destination appears safe for travel with normal precautions.';
  }

  getFallbackSecurityData() {
    return {
      riskLevel: 'low',
      alerts: [],
      isSafe: true,
      recommendation: 'No current security alerts available.'
    };
  }

  async suggestAlternativeDestinations(originalDestination, budget, country) {
    // Simple algorithm to suggest alternatives
    const alternatives = {
      'paris': ['lyon', 'bordeaux', 'nice'],
      'london': ['edinburgh', 'bath', 'york'],
      'rome': ['florence', 'venice', 'naples'],
      'madrid': ['barcelona', 'seville', 'valencia']
    };
    
    const suggested = alternatives[originalDestination.toLowerCase()] || [];
    
    return suggested.map(city => ({
      name: city,
      country,
      reason: 'Safe alternative with similar attractions',
      estimatedBudget: budget * 0.9 // Assume 10% less expensive
    }));
  }
}

module.exports = new SecurityService();
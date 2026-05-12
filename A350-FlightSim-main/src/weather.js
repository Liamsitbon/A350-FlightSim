/**
 * Weather System for A350 Flight Simulator
 * Includes multiple weather conditions with different effects on flight
 */

export class WeatherSystem {
  constructor() {
    this.currentWeather = 'clear';
    this.temperature = 15; // Celsius
    this.windSpeed = 0; // knots
    this.windDirection = 0; // degrees
    this.visibility = 10; // km
    this.cloudCeiling = 5000; // feet
    this.precipitation = 0; // 0-100%
    this.turbulence = 0; // 0-1.0
    
    // Weather conditions
    this.weatherConditions = {
      clear: {
        name: 'Clear Sky',
        color: 0x87CEEB,
        visibility: 10,
        windSpeed: 0,
        turbulence: 0,
        precipitation: 0,
        cloudCeiling: 10000,
        description: 'Clear skies, perfect flying conditions'
      },
      scattered: {
        name: 'Scattered Clouds',
        color: 0xB0C4DE,
        visibility: 9,
        windSpeed: 5,
        turbulence: 0.1,
        precipitation: 0,
        cloudCeiling: 4000,
        description: 'Light clouds with minimal weather'
      },
      broken: {
        name: 'Broken Clouds',
        color: 0x778899,
        visibility: 8,
        windSpeed: 10,
        turbulence: 0.2,
        precipitation: 0,
        cloudCeiling: 2500,
        description: 'Broken cloud cover, moderate conditions'
      },
      overcast: {
        name: 'Overcast',
        color: 0x696969,
        visibility: 6,
        windSpeed: 12,
        turbulence: 0.3,
        precipitation: 5,
        cloudCeiling: 1500,
        description: 'Complete cloud cover, limited visibility'
      },
      rain: {
        name: 'Rain',
        color: 0x4A5568,
        visibility: 3,
        windSpeed: 15,
        turbulence: 0.5,
        precipitation: 60,
        cloudCeiling: 1000,
        description: 'Moderate rain, reduced visibility'
      },
      heavyRain: {
        name: 'Heavy Rain',
        color: 0x2D3748,
        visibility: 1,
        windSpeed: 25,
        turbulence: 0.8,
        precipitation: 100,
        cloudCeiling: 500,
        description: 'Heavy downpour, challenging conditions'
      },
      thunderstorm: {
        name: 'Thunderstorm',
        color: 0x1A202C,
        visibility: 0.5,
        windSpeed: 40,
        turbulence: 1.0,
        precipitation: 100,
        cloudCeiling: 300,
        description: 'Severe thunderstorm, extreme turbulence'
      },
      fog: {
        name: 'Fog',
        color: 0xA9A9A9,
        visibility: 0.2,
        windSpeed: 5,
        turbulence: 0.1,
        precipitation: 0,
        cloudCeiling: 200,
        description: 'Dense fog, near zero visibility'
      },
      snow: {
        name: 'Snow',
        color: 0xFFFFFF,
        visibility: 1,
        windSpeed: 20,
        turbulence: 0.6,
        precipitation: 80,
        cloudCeiling: 800,
        description: 'Heavy snow, slippery conditions'
      },
      sandstorm: {
        name: 'Sandstorm',
        color: 0xD2B48C,
        visibility: 0.1,
        windSpeed: 35,
        turbulence: 0.7,
        precipitation: 0,
        cloudCeiling: 600,
        description: 'Severe dust/sand storm'
      },
      volcanic: {
        name: 'Volcanic Ash',
        color: 0x36454F,
        visibility: 0.3,
        windSpeed: 18,
        turbulence: 0.4,
        precipitation: 0,
        cloudCeiling: 400,
        description: 'Volcanic ash cloud, hazardous'
      }
    };
  }

  /**
   * Set weather condition
   */
  setWeather(weatherType) {
    if (this.weatherConditions[weatherType]) {
      const weather = this.weatherConditions[weatherType];
      this.currentWeather = weatherType;
      this.visibility = weather.visibility;
      this.windSpeed = weather.windSpeed;
      this.turbulence = weather.turbulence;
      this.precipitation = weather.precipitation;
      this.cloudCeiling = weather.cloudCeiling;
      return true;
    }
    return false;
  }

  /**
   * Get random weather
   */
  randomWeather() {
    const types = Object.keys(this.weatherConditions);
    const randomType = types[Math.floor(Math.random() * types.length)];
    this.setWeather(randomType);
    return this.currentWeather;
  }

  /**
   * Set temperature (in Celsius)
   */
  setTemperature(temp) {
    this.temperature = temp;
  }

  /**
   * Set wind conditions
   */
  setWind(speed, direction) {
    this.windSpeed = Math.max(0, speed);
    this.windDirection = direction % 360;
  }

  /**
   * Apply random wind variation
   */
  randomizeWind() {
    const variation = (Math.random() - 0.5) * 10;
    this.windSpeed = Math.max(0, this.windSpeed + variation);
    this.windDirection = (this.windDirection + (Math.random() - 0.5) * 30) % 360;
  }

  /**
   * Get wind effect on aircraft
   * Returns object with headwind, crosswind components
   */
  getWindEffect(aircraftHeading) {
    const windRadians = (this.windDirection * Math.PI) / 180;
    const headingRadians = (aircraftHeading * Math.PI) / 180;
    const relativeAngle = windRadians - headingRadians;

    const headwind = this.windSpeed * Math.cos(relativeAngle);
    const crosswind = this.windSpeed * Math.sin(relativeAngle);

    return {
      headwind: headwind,
      crosswind: crosswind,
      totalWind: this.windSpeed
    };
  }

  /**
   * Get turbulence effect (randomized)
   */
  getTurbulenceEffect() {
    const factor = this.turbulence;
    return {
      pitch: (Math.random() - 0.5) * factor * 0.5,
      roll: (Math.random() - 0.5) * factor * 0.5,
      yaw: (Math.random() - 0.5) * factor * 0.3,
      vertical: (Math.random() - 0.5) * factor * 2
    };
  }

  /**
   * Check if landing is possible
   */
  canLand() {
    return this.visibility >= 0.5 && this.windSpeed <= 30 && this.turbulence <= 0.8;
  }

  /**
   * Get landing difficulty rating (0-5)
   */
  getLandingDifficulty() {
    let difficulty = 0;
    
    if (this.visibility < 0.5) difficulty += 5;
    else if (this.visibility < 1) difficulty += 4;
    else if (this.visibility < 3) difficulty += 2;
    
    if (this.windSpeed > 25) difficulty += 5;
    else if (this.windSpeed > 20) difficulty += 3;
    else if (this.windSpeed > 15) difficulty += 1;
    
    if (this.turbulence > 0.8) difficulty += 5;
    else if (this.turbulence > 0.5) difficulty += 3;
    else if (this.turbulence > 0.2) difficulty += 1;
    
    return Math.min(5, difficulty);
  }

  /**
   * Get current weather info as string
   */
  getWeatherReport() {
    const weather = this.weatherConditions[this.currentWeather];
    return `
WEATHER REPORT:
Condition: ${weather.name}
Temperature: ${this.temperature}°C
Wind: ${this.windSpeed.toFixed(1)} kt from ${this.windDirection.toFixed(0)}°
Visibility: ${this.visibility.toFixed(1)} km
Cloud Ceiling: ${this.cloudCeiling} ft
Precipitation: ${this.precipitation}%
Status: ${weather.description}
Landing Difficulty: ${this.getLandingDifficulty()}/5
    `;
  }

  /**
   * Get weather color for HUD display
   */
  getWeatherColor() {
    return this.weatherConditions[this.currentWeather].color;
  }

  /**
   * Update weather dynamically (for continuous weather changes)
   */
  updateWeather(deltaTime) {
    // Slowly vary turbulence
    this.turbulence += (Math.random() - 0.5) * 0.01;
    this.turbulence = Math.max(0, Math.min(1, this.turbulence));

    // Slowly vary wind
    this.randomizeWind();

    // Slowly vary visibility based on precipitation
    if (this.precipitation > 0) {
      this.visibility = Math.max(0.1, this.visibility - Math.random() * 0.01);
    } else {
      this.visibility = Math.min(10, this.visibility + Math.random() * 0.005);
    }
  }

  /**
   * Get all available weather types
   */
  getAvailableWeatherTypes() {
    return Object.entries(this.weatherConditions).map(([key, value]) => ({
      id: key,
      name: value.name,
      description: value.description
    }));
  }
}

export default WeatherSystem;

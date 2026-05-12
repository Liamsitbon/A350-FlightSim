/**
 * Weather UI System
 * Manages weather display and controls in the flight simulator
 */

export class WeatherUI {
  constructor(weather) {
    this.weather = weather;
    this.weatherDisplay = null;
    this.weatherControls = null;
  }

  /**
   * Initialize weather UI elements
   */
  init(container) {
    // Create weather display panel
    this.weatherDisplay = document.createElement('section');
    this.weatherDisplay.className = 'weather-display hud hud-right';
    this.weatherDisplay.innerHTML = `
      <div class="weather-info">
        <div class="weather-block">
          <span class="weather-label">WEATHER</span>
          <strong id="weather-condition">Clear</strong>
        </div>
        <div class="weather-block">
          <span class="weather-label">TEMP</span>
          <strong id="weather-temp">15</strong>
          <span class="weather-unit">°C</span>
        </div>
        <div class="weather-block">
          <span class="weather-label">WIND</span>
          <strong id="weather-wind">0</strong>
          <span class="weather-unit">kt</span>
        </div>
        <div class="weather-block">
          <span class="weather-label">VIS</span>
          <strong id="weather-visibility">10</strong>
          <span class="weather-unit">km</span>
        </div>
        <div class="weather-block">
          <span class="weather-label">TURB</span>
          <strong id="weather-turbulence">0</strong>
          <span class="weather-unit">%</span>
        </div>
      </div>
    `;
    container.appendChild(this.weatherDisplay);

    // Create weather controls
    this.weatherControls = document.createElement('section');
    this.weatherControls.className = 'weather-controls';
    this.weatherControls.innerHTML = `
      <div class="controls-header">
        <h3>WEATHER CONTROL</h3>
        <button id="toggle-weather-panel" class="toggle-btn" aria-label="Toggle weather panel">−</button>
      </div>
      <div class="controls-content">
        <div class="control-group">
          <label for="weather-select">Condition:</label>
          <select id="weather-select">
            <option value="clear">Clear Sky</option>
            <option value="scattered">Scattered Clouds</option>
            <option value="broken">Broken Clouds</option>
            <option value="overcast">Overcast</option>
            <option value="rain">Rain</option>
            <option value="heavyRain">Heavy Rain</option>
            <option value="thunderstorm">Thunderstorm</option>
            <option value="fog">Fog</option>
            <option value="snow">Snow</option>
            <option value="sandstorm">Sandstorm</option>
            <option value="volcanic">Volcanic Ash</option>
          </select>
        </div>
        
        <div class="control-group">
          <label for="temp-control">Temperature: <span id="temp-value">15</span>°C</label>
          <input id="temp-control" type="range" min="-40" max="40" value="15" step="1" />
        </div>
        
        <div class="control-group">
          <label for="wind-speed-control">Wind Speed: <span id="wind-speed-value">0</span> kt</label>
          <input id="wind-speed-control" type="range" min="0" max="50" value="0" step="1" />
        </div>
        
        <div class="control-group">
          <label for="wind-dir-control">Wind Direction: <span id="wind-dir-value">0</span>°</label>
          <input id="wind-dir-control" type="range" min="0" max="359" value="0" step="5" />
        </div>
        
        <div class="control-group">
          <button id="random-weather-btn" class="control-btn">Random Weather</button>
          <button id="severe-weather-btn" class="control-btn">Severe Weather</button>
        </div>
      </div>
    `;
    container.appendChild(this.weatherControls);

    this.setupEventListeners();
    this.update();
  }

  /**
   * Setup event listeners for weather controls
   */
  setupEventListeners() {
    // Weather selection
    document.getElementById('weather-select').addEventListener('change', (e) => {
      this.weather.setWeather(e.target.value);
      this.update();
    });

    // Temperature control
    document.getElementById('temp-control').addEventListener('input', (e) => {
      const temp = parseInt(e.target.value);
      this.weather.setTemperature(temp);
      document.getElementById('temp-value').textContent = temp;
    });

    // Wind speed control
    document.getElementById('wind-speed-control').addEventListener('input', (e) => {
      const speed = parseInt(e.target.value);
      this.weather.setWind(speed, this.weather.windDirection);
      document.getElementById('wind-speed-value').textContent = speed;
      this.update();
    });

    // Wind direction control
    document.getElementById('wind-dir-control').addEventListener('input', (e) => {
      const direction = parseInt(e.target.value);
      this.weather.setWind(this.weather.windSpeed, direction);
      document.getElementById('wind-dir-value').textContent = direction;
    });

    // Random weather button
    document.getElementById('random-weather-btn').addEventListener('click', () => {
      this.weather.randomWeather();
      document.getElementById('weather-select').value = this.weather.currentWeather;
      this.update();
    });

    // Severe weather button
    document.getElementById('severe-weather-btn').addEventListener('click', () => {
      this.weather.setWeather('thunderstorm');
      this.weather.setWind(40, Math.random() * 360);
      this.weather.setTemperature(5 + Math.random() * 10);
      document.getElementById('weather-select').value = 'thunderstorm';
      this.update();
    });

    // Toggle weather panel
    document.getElementById('toggle-weather-panel').addEventListener('click', (e) => {
      const content = this.weatherControls.querySelector('.controls-content');
      const btn = e.target;
      if (content.style.display === 'none') {
        content.style.display = 'block';
        btn.textContent = '−';
      } else {
        content.style.display = 'none';
        btn.textContent = '+';
      }
    });
  }

  /**
   * Update weather display
   */
  update() {
    const weatherName = this.weather.weatherConditions[this.weather.currentWeather].name;
    
    document.getElementById('weather-condition').textContent = weatherName;
    document.getElementById('weather-temp').textContent = this.weather.temperature.toFixed(0);
    document.getElementById('weather-wind').textContent = this.weather.windSpeed.toFixed(1);
    document.getElementById('weather-visibility').textContent = this.weather.visibility.toFixed(1);
    document.getElementById('weather-turbulence').textContent = (this.weather.turbulence * 100).toFixed(0);

    // Update background color based on weather
    this.updateBackgroundColor();
    this.updateLandingWarning();
  }

  /**
   * Update 3D scene background color based on weather
   */
  updateBackgroundColor() {
    const color = this.weather.getWeatherColor();
    // This can be called from main.js to update the Three.js scene background
    window.dispatchEvent(new CustomEvent('weatherColorChanged', { detail: { color } }));
  }

  /**
   * Show landing difficulty warning
   */
  updateLandingWarning() {
    const difficulty = this.weather.getLandingDifficulty();
    let warningClass = '';
    let warningText = '';

    if (difficulty >= 5) {
      warningClass = 'critical';
      warningText = '⚠ LANDING CRITICAL';
    } else if (difficulty >= 3) {
      warningClass = 'warning';
      warningText = '⚠ LANDING DIFFICULT';
    } else if (difficulty >= 1) {
      warningClass = 'caution';
      warningText = '△ CAUTION';
    }

    let warningElement = document.getElementById('landing-warning');
    if (!warningElement && warningText) {
      warningElement = document.createElement('div');
      warningElement.id = 'landing-warning';
      warningElement.className = 'landing-warning';
      document.querySelector('.sim-shell').appendChild(warningElement);
    }

    if (warningElement) {
      warningElement.textContent = warningText;
      warningElement.className = `landing-warning ${warningClass}`;
      warningElement.style.display = warningText ? 'block' : 'none';
    }
  }

  /**
   * Display weather report (console)
   */
  showReport() {
    console.log(this.weather.getWeatherReport());
  }
}

export default WeatherUI;

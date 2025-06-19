navigator.geolocation.getCurrentPosition(success, error);

function success(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  console.log(latitude, longitude);
  
  fetchWeatherData(latitude, longitude);
}

function error() {
  console.log("Unable to retrieve your location.");
}
async function fetchWeatherData(lat, lon) {
    const apiKey = 'b1fb52c12b3c4223cc1e726bf0dd3fb9'; 
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  
    try {
      // Fetch both current and forecast in parallel
      const [forecastRes, currentRes] = await Promise.all([
        fetch(forecastUrl),
        fetch(currentUrl)
      ]);
      const forecastData = await forecastRes.json();
      const currentData = await currentRes.json();
      const hourlyData = forecastData.list.slice(0, 6); // next 6 x 3-hour intervals
      renderHourlyForecast(hourlyData, currentData);
    } catch (err) {
      console.error("Failed to fetch weather data:", err);
    }
  }
  
// Helper to map OpenWeatherMap icon/condition to a better SVG icon
function getWeatherIcon(condition, iconCode) {
  // Use basmilius weather icons CDN
  // See: https://github.com/basmilius/weather-icons
  // Fallback to OWM PNG if not found
  const iconMap = {
    'Thunderstorm': 'thunderstorms',
    'Drizzle': 'drizzle',
    'Rain': 'rain',
    'Snow': 'snow',
    'Clear': 'clear-day',
    'Clouds': 'cloudy',
    'Mist': 'mist',
    'Smoke': 'smoke',
    'Haze': 'haze',
    'Dust': 'dust',
    'Fog': 'fog',
    'Sand': 'sandstorm',
    'Ash': 'volcano',
    'Squall': 'wind',
    'Tornado': 'tornado'
  };
  let mapped = iconMap[condition] || 'cloudy';
  // Use night variant if iconCode ends with 'n'
  if (iconCode && iconCode.endsWith('n')) {
    if (mapped === 'clear-day') mapped = 'clear-night';
    else if (mapped === 'cloudy') mapped = 'cloudy-night';
  }
  mapped = mapped.toLowerCase(); // Ensure lowercase for CDN
  return `https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/svg/${mapped}.svg`;
}

function renderHourlyForecast(hourlyData, currentData) {
    const container = document.querySelector(".hourlyForecast");
    container.innerHTML = `
      <div class="hourly-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" id="clock-icon" class="bi bi-clock"
          viewBox="0 0 16 16">
          <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
          <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"/>
        </svg>
        <span id="Hourly-title">Hourly Forecast</span>
      </div>
      <hr class="divider">
      <div class="forecast-scroll"></div>
    `;
    const scrollContainer = container.querySelector(".forecast-scroll");

    // --- Add current weather as the first card ---
    if (currentData) {
      const now = new Date(currentData.dt * 1000);
      const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const temp = Math.round(currentData.main.temp);
      const iconCode = currentData.weather[0].icon;
      const condition = currentData.weather[0].main;
      console.log(condition);
      const iconUrl = getWeatherIcon(condition, iconCode);
      const card = document.createElement("div");
      card.className = "hour-card transparent-card current-card";
      card.innerHTML = `
        <div class="hour-time">Now</div>
        <img class="hour-icon" src="${iconUrl}" alt="${condition}" onerror="this.onerror=null;this.src='https://openweathermap.org/img/wn/${iconCode}@2x.png';">
        <div class="hour-temp">${temp}°C</div>
      `;
      scrollContainer.appendChild(card);
    }

    // --- Add forecast cards ---
    hourlyData.forEach((hour) => {
      const time = new Date(hour.dt * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const temp = Math.round(hour.main.temp);
      const iconCode = hour.weather[0].icon;
      const condition = hour.weather[0].main;
      const iconUrl = getWeatherIcon(condition, iconCode);
      const card = document.createElement("div");
      card.className = "hour-card transparent-card";
      card.innerHTML = `
        <div class="hour-time">${time}</div>
        <img class="hour-icon" src="${iconUrl}" alt="${condition}" onerror="this.onerror=null;this.src='https://openweathermap.org/img/wn/${iconCode}@2x.png';">
        <div class="hour-temp">${temp}°C</div>
      `;
      scrollContainer.appendChild(card);
    });
}


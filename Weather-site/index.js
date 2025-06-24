navigator.geolocation.getCurrentPosition(success, error);

function success(position) {
  const latitude = 25.4670//position.coords.latitude;
  const longitude = 91.3662//position.coords.longitude;
  console.log(latitude, longitude);
  
  fetchWeatherData(latitude, longitude);
  fetchPrecipitation(latitude,longitude);
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
      const condition = currentData.weather[0].main;

      var currentTemp = currentData.main.temp
      console.log(currentData);
      rainyDayRealTemp(currentTemp,condition);
      rainyDayCardDeets(currentData);
      
      
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

function rainyDayRealTemp(currentTemp,condition)
{
    $("#temp").text(`${currentTemp}°`);
    const dayMap = {
        'Thunderstorm': 'Thunderstorms expected',
        'Drizzle': 'Drizzles may come',
        'Rain': 'Rainy Day',
        'Snow': 'Snowy day',
        'Clear': 'Clear day',
        'Clouds': 'Cloudy day',
        'Mist': 'Mists',
        'Smoke': 'Smoke',
        'Haze': 'Haze',
        'Dust': 'Dusty day. Please wear a mask',
        'Fog': 'Heavy fogging',
        'Sand': 'Sandstorm',
        'Ash': 'Volcano erupted. Evacuate to safety',
        'Squall': 'Windy',
        'Tornado': 'Tornado incoming! Evacuate to safety.'
      };
      let dayMapped = dayMap[condition] || 'cloudy';
    $("#dayDeets").text(dayMapped);
}

function rainyDayCardDeets(currentData){
    var comment = generateWeatherComment(currentData);
    var comment2 = humidityComment(currentData.main.humidity);
    $("#feelsLikeTemp").text(`${currentData.main.feels_like}°`);
    $("#dayText").text(comment);
    $("#humid").text(`${currentData.main.humidity}%`);
    $("#humidComment").text(comment2);
    visibilityGenerator(currentData);

}



function generateWeatherComment(weatherData) {
    // Get the main weather condition
    const condition = weatherData.weather[0].main;

    let comment;
    switch (condition) {
        case 'Thunderstorm':
            comment = "Stay indoors! Thunderstorms are expected.";
            break;
        case 'Drizzle':
            comment = "Light drizzle outside. You might need an umbrella.";
            break;
        case 'Rain':
            comment = "It's raining. Don't forget your umbrella!";
            break;
        case 'Snow':
            comment = "Snowfall detected. Dress warmly!";
            break;
        case 'Clear':
            comment = "Clear skies ahead. Enjoy the sunshine!";
            break;
        case 'Clouds':
            comment = "It's cloudy today. A calm day ahead.";
            break;
        case 'Mist':
            comment = "Misty conditions. Drive carefully!";
            break;
        case 'Smoke':
            comment = "Smoky atmosphere. Limit outdoor activities.";
            break;
        case 'Haze':
            comment = "Hazy weather. Visibility might be low.";
            break;
        case 'Dust':
            comment = "Dusty conditions. Wear a mask if needed.";
            break;
        case 'Fog':
            comment = "Foggy weather. Watch out for low visibility.";
            break;
        case 'Sand':
            comment = "Sandy winds blowing. Stay protected.";
            break;
        case 'Ash':
            comment = "Ash in the air. Avoid going outside if possible.";
            break;
        case 'Squall':
            comment = "Squalls expected. Secure loose objects outdoors.";
            break;
        case 'Tornado':
            comment = "Tornado warning! Seek shelter immediately.";
            break;
        default:
            comment = "Weather data unavailable. Stay prepared!";
    }
    return comment;
}

function visibilityGenerator(currentData){
    var visibility=currentData.visibility;
    var comment = ""
    $("#visible").text(`${visibility/1000}km far`);
    if(visibility>= 10000){
        comment+= "Excellent visibility. Very clear conditions.";
    }
    else if(visibility>=5000 ){//&& visibility<10000
        comment+="Good visibility. Distant objects clearly visible.";
    }
    else if(visibility>=2000){
        comment+="Some haze or light mist may be present. Visibility slightly reduced.";
    }
    else if(visibility>=1000){
        comment+="Possibility of obstructed driving vision. Be cautious.";
    }
    else{
        comment+="Significant reduction in visibility. Be very careful while driving! ";
    }
    $("#visibleText").text(comment); 
}


async function fetchPrecipitation(lat, lon) {
    const apiKey = 'e234129346dd4e17b1e60902252006';  // Replace with your WeatherAPI key
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        // Extract precipitation in millimeters
        const precipitation = data.current.precip_mm;
        const condition = data.current.condition.text;
        const temperature = data.current.temp_c;

        var comment = pptComment(precipitation);

        console.log(`🌧️ Precipitation: ${precipitation} mm`);
        console.log(`🌤️ Condition: ${condition}`);
        console.log(`🌡️ Temperature: ${temperature}°C`);
        $("#ppt").text(`${precipitation}mm`);
        $("#pptText").text(comment);

    } catch (error) {
        console.error("❌ Error fetching weather data:", error);
    }
}
function pptComment(precipitationIn_mm) {
    let comment;

    switch (true) {
        case (precipitationIn_mm === 0):
            comment = "No rain. It's dry and clear!";
            break;
        case (precipitationIn_mm > 0 && precipitationIn_mm <= 2.5):
            comment = "Light drizzle. You might not need an umbrella.";
            break;
        case (precipitationIn_mm > 2.5 && precipitationIn_mm <= 10):
            comment = "Moderate rain. Consider carrying a light umbrella.";
            break;
        case (precipitationIn_mm > 10 && precipitationIn_mm <= 50):
            comment = "Steady showers. Umbrella highly recommended.";
            break;
        case (precipitationIn_mm > 50 && precipitationIn_mm <= 100):
            comment = "Heavy rain. Best to avoid stepping out unless necessary.";
            break;
        case (precipitationIn_mm > 100 && precipitationIn_mm <= 200):
            comment = "Very heavy rain. High chance of waterlogging and delays.";
            break;
        case (precipitationIn_mm > 200):
            comment = "🚨 Extreme rain! Stay indoors. Avoid travel unless it's an emergency.";
            break;
        default:
            comment = "Invalid precipitation value.";
    }

    return comment;
}

function humidityComment(humidityPercent) {
    let comment;

    switch (true) {
        case (humidityPercent < 20):
            comment = "Very dry air. Use moisturizer and stay hydrated.";
            break;
        case (humidityPercent >= 20 && humidityPercent < 40):
            comment = "Dry weather. You might feel your skin or throat getting dry.";
            break;
        case (humidityPercent >= 40 && humidityPercent < 60):
            comment = "Comfortable humidity. Ideal weather conditions!";
            break;
        case (humidityPercent >= 60 && humidityPercent < 80):
            comment = "Humid weather. You may feel a little sticky or sweaty.";
            break;
        case (humidityPercent >= 80 && humidityPercent <= 100):
            comment = "Very humid! Expect discomfort and sweating. Stay cool and hydrated.";
            break;
        default:
            comment = "⚠️ Invalid humidity value.";
    }

    return comment;
}


// Example usage:
// fetchWeather(12.9114, 77.607); // Bengaluru coordinates



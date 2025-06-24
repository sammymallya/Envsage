navigator.geolocation.getCurrentPosition(getLocationSuccess, handleLocationError);
$("#searchInput").keypress(function (e){
    var key = e.key;
    if(key === "Enter"){
        searchBar();
        console.log("Searched");
    }
    
})
async function getLocationSuccess(position) {
  const lat = 25.4670; // position.coords.latitude;
  const lon = 91.3662; // position.coords.longitude;

  fetchWeather(lat, lon);
  const forecastData = await fetchTenDayForecast(lat,lon);
  render10DayForecast(forecastData);
  fetchPrecipitation(lat, lon);
}

function handleLocationError() {
  console.error("Unable to retrieve your location.");
}

async function fetchWeather(lat, lon) {
  const apiKey = 'b1fb52c12b3c4223cc1e726bf0dd3fb9';
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  try {
    const [forecastRes, currentRes] = await Promise.all([
      fetch(forecastUrl),
      fetch(currentUrl)
    ]);

    const forecastData = await forecastRes.json();
    // console.log(forecastData);
    const currentData = await currentRes.json();

    updateMainWeather(currentData);
    renderHourlyForecast(forecastData.list.slice(0, 6), currentData);
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
  }
}

async function fetchTenDayForecast(lat, lon) {
    const apiKey = 'e234129346dd4e17b1e60902252006'; // Using weatherapi.com key from fetchPrecipitation
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=10`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data.forecast || !data.forecast.forecastday) {
            throw new Error("No forecast data found from weatherapi.com.");
        }
        
        console.log("10-Day Forecast Data:", data.forecast.forecastday);
        return data.forecast.forecastday; 
    } catch (error) {
        console.error("Error fetching 10-day forecast data:", error);
        return [];
    }
}

function updateMainWeather(data) {
  const temp = data.main.temp;
  const humidity = data.main.humidity;
  const condition = data.weather[0].main;

  $("#temp").text(`${temp}°`);
  $("#feelsLikeTemp").text(`${data.main.feels_like}°`);
  $("#dayDeets").text(conditionMap[condition] || condition);
  $("#dayText").text(generateWeatherComment(condition));
  $("#humid").text(`${humidity}%`);
  $("#humidComment").text(humidityComment(humidity));
  updateVisibility(data.visibility);
}

function updateVisibility(visibility) {
  const km = visibility / 1000;
  $("#visible").text(`${km}km far`);

  let comment = "";
  if (visibility >= 10000) comment = "Excellent visibility. Very clear conditions.";
  else if (visibility >= 5000) comment = "Good visibility. Distant objects clearly visible.";
  else if (visibility >= 2000) comment = "Some haze or light mist present. Visibility reduced.";
  else if (visibility >= 1000) comment = "Possibly obstructed driving vision. Be cautious.";
  else comment = "Significant visibility reduction. Be very careful while driving!";

  $("#visibleText").text(comment);
}

function getWeatherIcon(condition, iconCode) {
  const map = {
    'Thunderstorm': 'thunderstorms', 'Drizzle': 'drizzle', 'Rain': 'rain',
    'Snow': 'snow', 'Clear': 'clear-day', 'Clouds': 'cloudy',
    'Mist': 'mist', 'Smoke': 'smoke', 'Haze': 'haze', 'Dust': 'dust',
    'Fog': 'fog', 'Sand': 'sandstorm', 'Ash': 'volcano',
    'Squall': 'wind', 'Tornado': 'tornado'
  };
  let icon = map[condition] || 'cloudy';
  if (iconCode.endsWith('n')) {
    icon = icon === 'clear-day' ? 'clear-night' : 'cloudy-night';
  }
  return `https://cdn.jsdelivr.net/gh/basmilius/weather-icons/production/fill/svg/${icon.toLowerCase()}.svg`;
}

function renderHourlyForecast(hours, current) {
  const container = document.querySelector(".hourlyForecast");
  container.innerHTML = `
    <div class="hourly-title">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock" viewBox="0 0 16 16">
        <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"/>
      </svg>
      <span id="Hourly-title">3-Hourly Forecast</span>
    </div>
    <hr class="divider">
    <div class="forecast-scroll"></div>
  `;

  const scroll = container.querySelector(".forecast-scroll");

  const addCard = (timeLabel, temp, iconCode, condition) => {
    const iconUrl = getWeatherIcon(condition, iconCode);
    const card = document.createElement("div");
    card.className = "hour-card transparent-card";
    card.innerHTML = `
      <div class="hour-time">${timeLabel}</div>
      <img class="hour-icon" src="${iconUrl}" alt="${condition}" onerror="this.onerror=null;this.src='https://openweathermap.org/img/wn/${iconCode}@2x.png';">
      <div class="hour-temp">${temp}°C</div>
    `;
    scroll.appendChild(card);
  };

  addCard("Now", Math.round(current.main.temp), current.weather[0].icon, current.weather[0].main);

  hours.forEach(hour => {
    const time = new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    addCard(time, Math.round(hour.main.temp), hour.weather[0].icon, hour.weather[0].main);
  });
}

async function fetchPrecipitation(lat, lon) {
  const apiKey = 'e234129346dd4e17b1e60902252006';
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network issue");

    const data = await res.json();
    const ppt = data.current.precip_mm;

    $("#ppt").text(`${ppt}mm`);
    $("#pptText").text(pptComment(ppt));
  } catch (err) {
    console.error("Error fetching precipitation:", err);
  }
}

function pptComment(mm) {
  if (mm === 0) return "No rain. It's dry and clear!";
  if (mm <= 2.5) return "Light drizzle. You might not need an umbrella.";
  if (mm <= 10) return "Moderate rain. Consider carrying a light umbrella.";
  if (mm <= 50) return "Steady showers. Umbrella highly recommended.";
  if (mm <= 100) return "Heavy rain. Best to avoid stepping out unless necessary.";
  if (mm <= 200) return "Very heavy rain. High chance of waterlogging and delays.";
  return "🚨 Extreme rain! Stay indoors. Avoid travel unless it's an emergency.";
}

function humidityComment(humidity) {
  if (humidity < 20) return "Very dry air. Use moisturizer and stay hydrated.";
  if (humidity < 40) return "Dry weather. You might feel your skin or throat getting dry.";
  if (humidity < 60) return "Comfortable humidity. Ideal weather conditions!";
  if (humidity < 80) return "Humid weather. You may feel a little sticky or sweaty.";
  if (humidity <= 100) return "Very humid! Expect discomfort and sweating. Stay cool and hydrated.";
  return "⚠️ Invalid humidity value.";
}

function generateWeatherComment(condition) {
  const map = {
    'Thunderstorm': "Stay indoors! Thunderstorms are expected.",
    'Drizzle': "Light drizzle outside. You might need an umbrella.",
    'Rain': "It's raining. Don't forget your umbrella!",
    'Snow': "Snowfall detected. Dress warmly!",
    'Clear': "Clear skies ahead. Enjoy the sunshine!",
    'Clouds': "It's cloudy today. A calm day ahead.",
    'Mist': "Misty conditions. Drive carefully!",
    'Smoke': "Smoky atmosphere. Limit outdoor activities.",
    'Haze': "Hazy weather. Visibility might be low.",
    'Dust': "Dusty conditions. Wear a mask if needed.",
    'Fog': "Foggy weather. Watch out for low visibility.",
    'Sand': "Sandy winds blowing. Stay protected.",
    'Ash': "Ash in the air. Avoid going outside if possible.",
    'Squall': "Squalls expected. Secure loose objects outdoors.",
    'Tornado': "Tornado warning! Seek shelter immediately."
  };
  return map[condition] || "Weather data unavailable. Stay prepared!";
}

const conditionMap = {
  'Thunderstorm': 'Thunderstorms expected', 'Drizzle': 'Drizzles may come', 'Rain': 'Rainy Day',
  'Snow': 'Snowy day', 'Clear': 'Clear day', 'Clouds': 'Cloudy day',
  'Mist': 'Mists', 'Smoke': 'Smoke', 'Haze': 'Haze', 'Dust': 'Dusty day. Please wear a mask',
  'Fog': 'Heavy fogging', 'Sand': 'Sandstorm', 'Ash': 'Volcano erupted. Evacuate to safety',
  'Squall': 'Windy', 'Tornado': 'Tornado incoming! Evacuate to safety.'
};

let autocompleteTimeout = null;

$("#searchInput").on("input", function() {
    clearTimeout(autocompleteTimeout);
    const query = $(this).val().trim();
    if (!query) {
        $("#autocomplete-list").empty().hide();
        return;
    }
    autocompleteTimeout = setTimeout(() => {
        fetchLocationSuggestions(query);
    }, 250);
});

$(document).on("click", function(e) {
    if (!$(e.target).closest("#searchbar").length) {
        $("#autocomplete-list").empty().hide();
    }
});

async function fetchLocationSuggestions(query) {
    const apiKey = '244e35770f07eeed524561db59c48cb5';
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=7&appid=${apiKey}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        renderAutocompleteSuggestions(data);
    } catch (err) {
        $("#autocomplete-list").empty().hide();
    }
}

function renderAutocompleteSuggestions(suggestions) {
    const $list = $("#autocomplete-list");
    $list.empty();
    if (!suggestions || suggestions.length === 0) {
        $list.hide();
        return;
    }
    // Sort by population (if available), then by country code (prioritize well-known countries)
    suggestions.sort((a, b) => (b.population || 0) - (a.population || 0));
    suggestions.forEach(item => {
        const displayName = `${item.name}${item.state ? ', ' + item.state : ''}, ${item.country}`;
        const $item = $(`<div class="autocomplete-item"></div>`).text(displayName);
        $item.on("mousedown", function(e) {
            e.preventDefault();
            $("#searchInput").val(displayName);
            $list.empty().hide();
        });
        $list.append($item);
    });
    $list.show();
}

async function searchWeather(place){
    const apiKey = '244e35770f07eeed524561db59c48cb5';
    const geocoder = `http://api.openweathermap.org/geo/1.0/direct?q=${place}&limit=5&appid=${apiKey}`;
    try {
        const searchRes = await fetch(geocoder);
        const searchData = await searchRes.json();
        // console.log(searchData);
        
        const latitude = searchData[0].lat;
        const longitude = searchData[0].lon;
        return ([latitude,longitude]);
        
        
    }catch(error){
        console.log("Could'nt fetch location data ",error);
    }      
        
}

function searchBar(){
    var searchInput = $("#searchInput").val();
    // if (searchInput===""){
    //     alert("Enter valid input");
    // }
    var coordinates = searchWeather(searchInput)
    .then(async(coordinates) => {
        // console.log("Coordinates: ", coordinates);
        var latitude = coordinates[0];
        var longitude = coordinates[1];
        // console.log(latitude, longitude);
        fetchWeather(latitude, longitude);
        fetchPrecipitation(latitude, longitude);
        const forecastData = await fetchTenDayForecast(latitude, longitude);
        render10DayForecast(forecastData);
    })
    .catch((error) => {
        console.log("Error fetching coordinates", error);
    });
}

function render10DayForecast(forecastDays) {
  const container = document.querySelector(".tenDayForecast");
  container.innerHTML = `
      <div class="tenDay-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-calendar2-week" viewBox="0 0 16 16">
            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 3a1 1 0 0 1 1-1h1v.5a.5.5 0 0 0 1 0V2h8v.5a.5.5 0 0 0 1 0V2h1a1 1 0 0 1 1 1v2H1V3zm0 3v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6H1zm2.5 2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5zm3 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5z"/>
          </svg>
          <span>10-Day Forecast</span>
      </div>
      <hr class="divider">
      <div class="tenDay-scroll"></div>
  `;

  const scroll = container.querySelector(".tenDay-scroll");
  scroll.innerHTML = ''; // Clear previous cards

  forecastDays.forEach(dayEntry => {
      const date = new Date(dayEntry.date);
      const day = date.toLocaleDateString("en-US", { weekday: 'short' });
      const fullDate = date.toLocaleDateString("en-US", { day: 'numeric', month: 'short' });

      const temp = Math.round(dayEntry.day.avgtemp_c);
      const iconUrl = "https:" + dayEntry.day.condition.icon;
      const condition = dayEntry.day.condition.text;

      const card = document.createElement("div");
      card.className = "tenDay-card transparent-card";
      card.innerHTML = `
          <div class="hour-time">${day}, ${fullDate}</div>
          <img class="day-icon" src="${iconUrl}" alt="${condition}">
          <div class="hour-temp">${temp}°C</div>
      `;
      scroll.appendChild(card);
  });
}



// API configuration
const API_KEY = '4f08e8cb9ccee9da59bf0abe9f6d2b7c'; // You'll need to add your OpenWeatherMap API key here
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM elements
const themeToggle = document.getElementById('theme-toggle');
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const weatherContainer = document.getElementById('weather-container');
const weatherInfo = document.getElementById('weather-info');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// Weather display elements
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const feelsLike = document.getElementById('feels-like');
const weatherDescription = document.getElementById('weather-description');
const windSpeed = document.getElementById('wind-speed');
const humidity = document.getElementById('humidity');
const pressure = document.getElementById('pressure');
const visibility = document.getElementById('visibility');
const forecastContainer = document.getElementById('forecast');

// Theme toggle functionality
function initTheme() {
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    } else if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
        themeToggle.checked = false;
    } else {
        // If no saved preference, check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.classList.add('dark-mode');
            themeToggle.checked = true;
            localStorage.setItem('theme', 'dark');
        }
    }
}

function toggleTheme() {
    if (themeToggle.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
}

// Format date
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatDay(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Convert temperature from Kelvin to Celsius
function kelvinToCelsius(kelvin) {
    return Math.round(kelvin - 273.15);
}

// Convert visibility from meters to kilometers
function metersToKilometers(meters) {
    return (meters / 1000).toFixed(1);
}

// Show loader
function showLoader() {
    loader.classList.remove('hidden');
    weatherInfo.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

// Show weather data
function showWeatherInfo() {
    loader.classList.add('hidden');
    weatherInfo.classList.remove('hidden');
    errorMessage.classList.add('hidden');
}

// Show error message
function showError(message) {
    loader.classList.add('hidden');
    weatherInfo.classList.add('hidden');
    errorMessage.classList.remove('hidden');
    errorText.textContent = message;
}

// Fetch current weather data
async function fetchCurrentWeather(city) {
    try {
        const response = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found. Please try again.');
            } else {
                throw new Error('Failed to fetch weather data. Please try again later.');
            }
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

// Fetch forecast data
async function fetchForecast(city) {
    try {
        const response = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch forecast data.');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

// Display current weather
function displayCurrentWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    currentDate.textContent = formatDate(data.dt);
    
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.alt = data.weather[0].description;
    
    temperature.textContent = `${kelvinToCelsius(data.main.temp)}°C`;
    feelsLike.textContent = `Feels like: ${kelvinToCelsius(data.main.feels_like)}°C`;
    weatherDescription.textContent = data.weather[0].description;
    
    windSpeed.textContent = `${data.wind.speed} m/s`;
    humidity.textContent = `${data.main.humidity}%`;
    pressure.textContent = `${data.main.pressure} hPa`;
    visibility.textContent = `${metersToKilometers(data.visibility)} km`;
}

// Display forecast
function displayForecast(data) {
    forecastContainer.innerHTML = '';
    
    // Get one forecast per day (at noon)
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    
    // Limit to 5 days
    const fiveDayForecast = dailyForecasts.slice(0, 5);
    
    fiveDayForecast.forEach(day => {
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        
        const iconCode = day.weather[0].icon;
        
        forecastItem.innerHTML = `
            <div class="forecast-date">${formatDay(day.dt)}</div>
            <img class="forecast-icon" src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${day.weather[0].description}">
            <div class="forecast-temp">${kelvinToCelsius(day.main.temp)}°C</div>
            <div class="forecast-desc">${day.weather[0].description}</div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

// Get weather data
async function getWeatherData(city) {
    showLoader();
    
    try {
        const [currentData, forecastData] = await Promise.all([
            fetchCurrentWeather(city),
            fetchForecast(city)
        ]);
        
        displayCurrentWeather(currentData);
        displayForecast(forecastData);
        showWeatherInfo();
        
        // Save last searched city
        localStorage.setItem('lastCity', city);
    } catch (error) {
        showError(error.message);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    // Load last searched city if available
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        cityInput.value = lastCity;
        getWeatherData(lastCity);
    }
});

themeToggle.addEventListener('change', toggleTheme);

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    
    if (city) {
        getWeatherData(city);
    }
});

// Check if API key is provided
window.addEventListener('load', () => {
    if (!API_KEY) {
        showError('Please add your OpenWeatherMap API key in the script.js file.');
    }
});
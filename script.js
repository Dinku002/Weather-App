const apiKey = '28124b13d69f4e78b9d153428251202';

async function getWeather() {
    const location = document.getElementById('city').value.trim();
    if (!location) return alert('Please enter a location');

    const currentWeatherUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${location}&aqi=no`;
    const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=7&aqi=no&alerts=no`;

    try {
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ]);

        if (!currentResponse.ok || !forecastResponse.ok) throw new Error('Location not found');

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        displayWeather(currentData);
        displayForecast(forecastData);
        saveSearch(location);
    } catch (error) {
        alert(error.message);
    }
}

function displayWeather(data) {
    document.getElementById('weather-info').innerHTML = `
        <h2>${data.location.name}, ${data.location.region}, ${data.location.country}</h2>
        <img src="${data.current.condition.icon}" alt="${data.current.condition.text}">
        <p>Condition: ${data.current.condition.text}</p>
        <p>Temperature: ${data.current.temp_c}°C</p>
        <p>Humidity: ${data.current.humidity}%</p>
        <p>Wind: ${data.current.wind_kph} km/h</p>
    `;
}

function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = data.forecast.forecastday.map(day => `
        <div class="day">
            <p>${day.date}</p>
            <img src="${day.day.condition.icon}" alt="${day.day.condition.text}">
            <p>${day.day.condition.text}</p>
            <p>Temp: ${day.day.avgtemp_c}°C</p>
            <p>Wind: ${day.day.maxwind_kph} km/h</p>
            <p>Humidity: ${day.day.avghumidity}%</p>
        </div>
    `).join('');
}

function saveSearch(location) {
    let searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    if (!searches.includes(location)) {
        searches.push(location);
        localStorage.setItem('recentSearches', JSON.stringify(searches));
    }
    updateSearchDropdown();
}

function updateSearchDropdown() {
    const searches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    const dropdown = document.getElementById('recent-searches');
    dropdown.innerHTML = `<option value="">Recent Searches</option>` + 
        searches.map(loc => `<option value="${loc}">${loc}</option>`).join('');
}

function setCity(location) {
    if (location) {
        document.getElementById('city').value = location;
        getWeather();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateSearchDropdown();
    document.getElementById('use-location').addEventListener('click', getLocationWeather);
});

async function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const currentWeatherUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}&aqi=no`;
            const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=7&aqi=no&alerts=no`;

            try {
                const [currentResponse, forecastResponse] = await Promise.all([
                    fetch(currentWeatherUrl),
                    fetch(forecastUrl)
                ]);

                if (!currentResponse.ok || !forecastResponse.ok) throw new Error('Unable to fetch location-based weather');

                const currentData = await currentResponse.json();
                const forecastData = await forecastResponse.json();

                displayWeather(currentData);
                displayForecast(forecastData);
            } catch (error) {
                alert(error.message);
            }
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

const weatherCodes = {
    0: { text: 'Klarer Himmel', icon: '☀️' },
    1: { text: 'Überwiegend klar', icon: '🌤️' },
    2: { text: 'Teilweise bewölkt', icon: '⛅' },
    3: { text: 'Bedeckt', icon: '☁️' },
    45: { text: 'Nebel', icon: '🌫️' },
    48: { text: 'Rauhreifnebel', icon: '🌫️' },
    51: { text: 'Leichter Sprühregen', icon: '🌧️' },
    53: { text: 'Mäßiger Sprühregen', icon: '🌧️' },
    55: { text: 'Starker Sprühregen', icon: '🌧️' },
    61: { text: 'Leichter Regen', icon: '🌧️' },
    63: { text: 'Mäßiger Regen', icon: '🌧️' },
    65: { text: 'Starker Regen', icon: '🌧️' },
    71: { text: 'Leichter Schneefall', icon: '❄️' },
    73: { text: 'Mäßiger Schneefall', icon: '❄️' },
    75: { text: 'Starker Schneefall', icon: '❄️' },
    80: { text: 'Leichte Schauer', icon: '🌦️' },
    81: { text: 'Mäßige Schauer', icon: '🌦️' },
    82: { text: 'Starke Schauer', icon: '⛈️' },
    95: { text: 'Gewitter', icon: '🌩️' }
};

async function getWeatherByIP() {
    try {
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();

        if (ipData.error) throw new Error("IP-Ortung nicht möglich");

        document.getElementById('cityInput').value = ipData.city;
        fetchWeather(ipData.latitude, ipData.longitude, `${ipData.city}, ${ipData.country_code}`);
    } catch (err) {
        getWeatherByCity('Stuttgart');
    }
}

async function getWeatherByCity(overrideCity = null) {
    const city = overrideCity || document.getElementById('cityInput').value.trim();
    const errorEl = document.getElementById('errorMsg');
    errorEl.textContent = '';

    if (!city) return;

    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=de`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            errorEl.textContent = 'Stadt konnte nicht gefunden werden!';
            return;
        }

        const location = geoData.results[0];
        fetchWeather(location.latitude, location.longitude, `${location.name}, ${location.country_code.toUpperCase()}`);
    } catch (err) {
        errorEl.textContent = 'Fehler beim Abrufen der Koordinaten.';
    }
}

async function fetchWeather(lat, lon, name) {
    const errorEl = document.getElementById('errorMsg');

    try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;

        const response = await fetch(weatherUrl);
        const data = await response.json();

        const current = data.current;
        const currentInfo = weatherCodes[current.weather_code] || { text: 'Unbekannt', icon: '❓' };

        document.getElementById('cityName').textContent = name;
        document.getElementById('temperature').textContent = `${Math.round(current.temperature_2m)}°C`;
        document.getElementById('condition').textContent = `${currentInfo.icon} ${currentInfo.text}`;
        document.getElementById('windSpeed').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
        document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
        document.getElementById('pop').textContent = `${data.daily.precipitation_probability_max[0]}%`;

        renderForecast(data.daily);

    } catch (err) {
        errorEl.textContent = 'Fehler beim Laden der Wetterdaten.';
    }
}

function renderForecast(dailyData) {
    const forecastList = document.getElementById('forecastList');
    forecastList.innerHTML = '';

    for (let i = 0; i < 5; i++) {
        const date = new Date(dailyData.time[i]);

        let dayName = date.toLocaleDateString('de-DE', { weekday: 'short' });
        if (i === 0) dayName = 'Heute';
        if (i === 1) dayName = 'Morgen';

        const code = dailyData.weather_code[i];
        const info = weatherCodes[code] || { text: '', icon: '❓' };
        const maxTemp = Math.round(dailyData.temperature_2m_max[i]);
        const minTemp = Math.round(dailyData.temperature_2m_min[i]);

        const item = document.createElement('div');
        item.className = 'forecast-row';
        item.innerHTML = `
                    <span class="forecast-day">${dayName}</span>
                    <span class="forecast-icon" title="${info.text}">${info.icon}</span>
                    <div class="forecast-temps">
                        <span class="forecast-max">${maxTemp}°</span>
                        <span class="forecast-min">${minTemp}°</span>
                    </div>
                `;

        forecastList.appendChild(item);
    }
}

document.getElementById('cityInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getWeatherByCity();
});

getWeatherByIP();
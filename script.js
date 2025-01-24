const apiKey = 'c1cc05219aaf07f2289681e011217fe5';
const searchBox = document.querySelector('.search-box');
const searchBtn = document.querySelector(".search-btn");

const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');

const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const mainConditionTxt = document.querySelector('.main-weather-condition');
const currenDate = document.querySelector('.current-date');
const conditionTxt = document.querySelector('.description-condition-txt');
const humidityValue = document.querySelector('.humidity-value');
const pressureValue = document.querySelector('.pressure-value');
const windValue = document.querySelector('.wind-value');
const windDirection = document.querySelector('.wind-direction');
const weatherSummaryImg = document.querySelector('.weather-summary-img');

const forecastItemsContainer = document.querySelector('.forecast-item-container');

// Event listener for search button
searchBtn.addEventListener('click', () => {
    if (searchBox.value.trim() != '') {
        updateWeatherInfo(searchBox.value);
        searchBox.value = '';
        searchBox.blur();
    }
});

// Event listener for 'Enter' key in search box
searchBox.addEventListener('keydown', (event) => {
    if (event.key == 'Enter' && searchBox.value.trim() != '') {
        updateWeatherInfo(searchBox.value);
        searchBox.value = '';
        searchBox.blur();
    }
});

// Fetch data from the backend (PHP)
async function getFetchData(city) {
    const url = `http://localhost/weather/connection.php?q=${city}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('City not found or API error');
        return response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("There was something wrong while fetching data");
        return null;
    }
}

// Get the current date in a readable format
function getCurrentDate() {
    const currenDate = new Date();
    const options = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };
    return currenDate.toLocaleDateString('en-GB', options);
}

// Update weather information on the page
async function updateWeatherInfo(city) {
    const weatherData = await getFetchData(city);

    if (!weatherData || weatherData.length === 0) {
        showDisplaySection(notFoundSection);
        return;
    }

    console.log(weatherData);

    const {
        CityName: enterCity,
        temp,
        icon,
        main,
        Descriptions: description,
        humidity,
        pressure,
        wind,
        direction,
    } = weatherData[0];

    countryTxt.textContent = enterCity;
    tempTxt.textContent = Math.round(temp) + '°C';
    mainConditionTxt.textContent = main;
    conditionTxt.textContent = description;
    humidityValue.textContent = humidity + '%';
    pressureValue.textContent = pressure + ' hPa';
    windValue.textContent = wind + ' M/s';
    windDirection.textContent = direction + '°';
    currenDate.textContent = getCurrentDate();

    const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;
    weatherSummaryImg.src = iconUrl;

    await updateForecastInfo(city);
    showDisplaySection(weatherInfoSection);
}

// Update forecast information
async function updateForecastInfo(city) {
    const forecastsData = await getFetchData(city);

    const timeTaken = '12:00:00';
    const todayDate = new Date().toISOString().split('T')[0];

    forecastItemsContainer.innerHTML = '';
    forecastsData.forEach(forecastWeather => {
        if (forecastWeather.dt_txt && forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate)) {
            updateForecastItems(forecastWeather);
        }
    });
}

// Update forecast items in the UI
function updateForecastItems(weatherData) {
    const { dt_txt: date, weather: [{ id }], main: { temp } } = weatherData;

    const dateTaken = new Date(date);
    const dateOption = {
        day: 'numeric',
        month: 'short'
    };
    const dateResult = dateTaken.toLocaleDateString('en-US', dateOption);

    const forecastItem = `
        <div class="forecast-item" style="display: flex;">
            <h5 class="forecast-item-date">${dateResult}</h5>
            <img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>
    `;

    forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
}

// Show a specific display section
function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection]
        .forEach(section => section.style.display = 'none');

    section.style.display = 'flex';
}

// Load initial weather data (default city 'Kathmandu')
window.addEventListener('load', () => {
    updateWeatherInfo('Kathmandu');
});

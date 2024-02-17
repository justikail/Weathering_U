// ** - VAR CONST LETS - **
var secondButton = document.querySelector(".second");
const searchBarInput = document.querySelector(".search__input");
const searchButton = document.querySelector(".first");
const locationButton = document.querySelector(".current__location");
const currentWeatherDiv = document.querySelector(".current__weather");
const weatherCardsDiv = document.querySelector(".weather__cards");
const API_KEY = "7049fb17844c33705fb18cbc7e2dec52";

// ** - SPAWN SEARCH BOX - **
function SearchSpawn() {
  var menuBtn = document.getElementById("search__box");

  if (menuBtn.className === "header__search") {
    menuBtn.className += " spawn";
  } else {
    menuBtn.className = "header__search";
  }
}

// ** - SEARCH BAR CLEAR LOGIC - **
searchBarInput.addEventListener("input", function () {
  if (searchBarInput.value.trim() !== "") {
    secondButton.style.display = "block";
  } else {
    secondButton.style.display = "none";
  }
});

function ClearSearchBar() {
  searchBarInput.value = "";
  secondButton.style.display = "none";
}

// ** - MAIN LOGIC - **
const createWeatherCard = (cityName, weatherItem, index) => {
  if (index === 0) {
    return `<div class="details">
                  <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                  <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)} °C</h6>
                  <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                  <h6>Humidity: ${weatherItem.main.humidity}%</h6>
              </div>
              <div class="icon">
                  <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                  <h6>${weatherItem.weather[0].description}</h6>
              </div>`;
  } else {
    return `<li class="card">
                  <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                  <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                  <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)} °C</h6>
                  <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                  <h6>Humidity: ${weatherItem.main.humidity}%</h6>
              </li>`;
  }
};

const getWeatherDetails = (cityName, latitude, longitude) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

  fetch(WEATHER_API_URL)
    .then((response) => response.json())
    .then((data) => {
      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      searchBarInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      fiveDaysForecast.forEach((weatherItem, index) => {
        const html = createWeatherCard(cityName, weatherItem, index);
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML("beforeend", html);
        } else {
          weatherCardsDiv.insertAdjacentHTML("beforeend", html);
        }
      });
    })
    .catch(() => {
      alert("An error occurred while fetching the weather forecast!");
    });
};

const getCityCoordinates = () => {
  const cityName = searchBarInput.value.trim();
  if (cityName === "") return;
  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(API_URL)
    .then((response) => response.json())
    .then((data) => {
      if (!data.length) return alert(`No coordinates found for ${cityName}`);
      const { lat, lon, name } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert("An error occurred while fetching the coordinates!");
    });
};

const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      fetch(API_URL)
        .then((response) => response.json())
        .then((data) => {
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => {
          alert("An error occurred while fetching the city name!");
        });
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert("Geolocation request denied. Please reset location permission to grant access again.");
      } else {
        alert("Geolocation request error. Please reset location permission.");
      }
    }
  );
};

window.addEventListener("load", () => {
  if ("geolocation" in navigator) {
    getUserCoordinates();
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
searchBarInput.addEventListener("keyup", (e) => e.key === "Enter" && getCityCoordinates());

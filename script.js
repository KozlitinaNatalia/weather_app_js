let apiKey = "5f472b7acba333cd8a035ea85a0d4d4c";
let apiKey1 = "327540b38b7o0at269e72457c8af0e5b";

function formatDate(timestamp) {
  return `${formatDay(timestamp)} ${formatTime(timestamp)}`;
}

function formatDay(timestamp) {
  let date = new Date(timestamp * 1000);
  let day = date.getDay();
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day];
}

function formatTime(timestamp) {
  let date = new Date(timestamp * 1000);
  let hour = date.getHours();
  let minutes = date.getMinutes();
  return `${lessThanTen(hour)}:${lessThanTen(minutes)}`;
}

function lessThanTen(unit) {
  return unit < 10 ? `0${unit}` : unit;
}

function displayForecast(response) {
  console.log(response);
  let forecast = response.daily;
  console.log(forecast);
  let forecastElement = document.querySelector("#forecast");
  let forecastHTML = `<div class="row">`;
  forecast.forEach(function (forecastDay, index) {
    if (index < 7) {
      forecastHTML =
        forecastHTML +
        `
        <div class="col-6">
          <span class="weather-forecast-date">
          ${formatDay(forecastDay.time)}
          </span>
        </div>
          <div class="col-2">
            <span class=" weather-forecast-temperatures weather-forecast-temperature-min"> ${Math.round(
              forecastDay.temperature.minimum
            )}° </span>
            </div>
            <div class="col-2">
            <img
              src="${forecastDay.condition.icon_url}"
              alt=""
              width="42"
            />
            </div>
            <div class="col-2">
            <span class="weather-forecast-temperatures weather-forecast-temperature-max"> ${Math.round(
              forecastDay.temperature.maximum
            )}° </span>
            </div>
    `;
    }
  });

  forecastHTML = forecastHTML + `</div>`;
  forecastElement.innerHTML = forecastHTML;
}

const codeMapping = {
  "01d": "clear-sky-day",
  "01n": "clear-sky-night",
  "02d": "few-clouds-day",
  "02n": "few-clouds-night",
  "03d": "scattered-clouds-day",
  "03n": "scattered-clouds-night",
  "04d": "broken-clouds-day",
  "04n": "broken-clouds-night",
  "09d": "shower-rain-day",
  "09n": "shower-rain-night",
  "10d": "rain-day",
  "10n": "rain-night",
  "11d": "thunderstorm-day",
  "11n": "thunderstorm-night",
  "13d": "snow-day",
  "13n": "snow-night",
  "50d": "mist-day",
  "50n": "mist-night",
};

function displayHourlyForecast(response) {
  let forecastData = response.list;
  let pageSize = 6;
  let currentPage = 1;

  function displayList() {
    let hourlyElement = document.querySelector("#hourly-forecast > .row");
    hourlyElement.innerHTML = "";
    forecastData
      .filter((_, index) => {
        let start = (currentPage - 1) * pageSize;
        let end = currentPage * pageSize;
        if (index >= start && index < end) return true;
      })
      .forEach(function (forecastHour) {
        let hourlyHTML = `
        <div class="col-2">
          <div class="weather-forecast-date">${formatTime(
            forecastHour.dt
          )}</div>
          <img
          src="http://shecodes-assets.s3.amazonaws.com/api/weather/icons/${
            codeMapping[forecastHour.weather[0].icon]
          }.png" alt=""
            width="42"
          />
          <div class="weather-forecast-temperatures text-center">
             ${Math.round(forecastHour.main.temp)}°
          </div>
        </div>
    `;
        hourlyElement.innerHTML = hourlyElement.innerHTML + hourlyHTML;
      });
  }
  displayList();

  function previousPage() {
    if (currentPage > 1) {
      currentPage--;
      displayList();
    }
  }

  function nextPage() {
    if (currentPage * pageSize < forecastData.length) {
      currentPage++;
      displayList();
    }
  }

  document
    .querySelector("#prevButton")
    .addEventListener("click", previousPage, false);

  document
    .querySelector("#nextButton")
    .addEventListener("click", nextPage, false);
}

function getForecast(coordinates) {
  let api = `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${apiKey}&units=metric`;
  let apiSheCodes = `https://api.shecodes.io/weather/v1/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&key=${apiKey1}&units=metric`;
  fetch(apiSheCodes)
    .then((response) => response.json())
    .then((response) => displayForecast(response));
  fetch(api)
    .then((response) => response.json())
    .then((response) => displayHourlyForecast(response));
}

function displayTemperature(response) {
  let temperatureElement = document.querySelector("#temperature");
  let cityElement = document.querySelector("#city");
  let descriptionElement = document.querySelector("#description");
  let humidityElement = document.querySelector("#humidity");
  let windElement = document.querySelector("#wind");
  let dateElement = document.querySelector("#date");
  let iconElement = document.querySelector("#icon");
  let feelsLikeElement = document.querySelector("#feels");
  let sunriseElement = document.querySelector("#sunrise");
  let sunsetElement = document.querySelector("#sunset");

  celsiusTemperature = response.main.temp;

  temperatureElement.innerHTML = Math.round(celsiusTemperature);
  cityElement.innerHTML = response.name;
  descriptionElement.innerHTML = response.weather[0].description;
  humidityElement.innerHTML = response.main.humidity;
  windElement.innerHTML = Math.round(response.wind.speed);
  dateElement.innerHTML = formatDate(response.dt);
  feelsLikeElement.innerHTML = Math.round(response.main.feels_like);
  sunriseElement.innerHTML = formatTime(response.sys.sunrise);
  sunsetElement.innerHTML = formatTime(response.sys.sunset);
  iconElement.setAttribute(
    "src",
    `http://shecodes-assets.s3.amazonaws.com/api/weather/icons/${
      codeMapping[response.weather[0].icon]
    }.png`
  );
  iconElement.setAttribute("alt", response.weather[0].description);

  getForecast(response.coord);
}

function search(city) {
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  fetch(apiUrl)
    .then((response) => response.json())
    .then((response) => displayTemperature(response));
}

function handleSubmit(event) {
  event.preventDefault();
  let cityInputElement = document.querySelector("#city-input");
  search(cityInputElement.value);
}

let form = document.querySelector("#search-form");
form.addEventListener("submit", handleSubmit);

navigator.geolocation.getCurrentPosition(retrievePosition);

function showCurrentCity(event) {
  event.preventDefault();
  navigator.geolocation.getCurrentPosition(retrievePosition);
}

function retrievePosition(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  fetch(url)
    .then((response) => response.json())
    .then((response) => displayTemperature(response));
}

let checkCity = document.querySelector(".current");
checkCity.addEventListener("click", showCurrentCity);

function displayFahrenheitTemperature(event) {
  event.preventDefault();
  let temperatureElement = document.querySelector("#temperature");
  let fahrenheitTemperature = (celsiusTemperature * 9) / 5 + 32;
  celsiusLink.classList.remove("active");
  fahrenheitLink.classList.add("active");
  temperatureElement.innerHTML = Math.round(fahrenheitTemperature);
}

function displayCelsiusTemperature(event) {
  event.preventDefault();
  celsiusLink.classList.add("active");
  fahrenheitLink.classList.remove("active");
  let temperatureElement = document.querySelector("#temperature");
  temperatureElement.innerHTML = Math.round(celsiusTemperature);
}

let celsiusTemperature = null;

let fahrenheitLink = document.querySelector("#fahrenheit-link");
fahrenheitLink.addEventListener("click", displayFahrenheitTemperature);

let celsiusLink = document.querySelector("#celsius-link");
celsiusLink.addEventListener("click", displayCelsiusTemperature);
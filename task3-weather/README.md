# Skycast: Real-Time Weather App

Search any city for current conditions, an hourly trend and a 5-day forecast. No build step.

## Run locally
Open this folder in VS Code, install **Live Server**, right-click `index.html` > **Open with Live Server**.

## Data source
- **Default: Open-Meteo.** Free, no API key, works immediately.
- **OpenWeatherMap:** paste your free key into `js/config.js` (`OWM_KEY`) and the app switches automatically
  (Geocoding + Current Weather + 5-day/3-hour Forecast, grouped into days by the city's local date). New keys can take up to 2 hours to activate.
- Both providers are normalized to one data shape in `js/api.js`, so the UI is identical.

## Features
Autocomplete search (debounced, keyboard navigation), geolocation, C/F toggle, animated condition icons, sky that changes with weather and day/night,
rain/snow/star effects, city-local time, humidity, wind direction, pressure, visibility, sunrise/sunset, UV (Open-Meteo), 24-hour trend, 5-day cards,
favourites and recent cities, remembers your last city and units, 10-minute cache with offline fallback, request cancellation, loading, offline, timeout,
rate-limit, bad-key and unknown-city errors.

## Production note
A key placed in frontend code is public. For a real deployment, send OpenWeatherMap requests through a small serverless function (Vercel/Netlify) that holds the key in an environment variable.

## Deploy
Push to GitHub, then import into Vercel/Netlify (no build command) or enable GitHub Pages.

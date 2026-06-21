import axios from 'axios';

// Weather cache: coordinate key -> { data, timestamp }
const weatherCache = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// @desc    Get live weather metrics from Open-Meteo
// @route   GET /api/weather
// @access  Private
export const getWeather = async (req, res, next) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    res.status(400);
    return next(new Error('Latitude and Longitude query parameters are required'));
  }

  // Generate cache key rounded to 2 decimal places (approx. 1.1 km precision)
  const cacheKey = `${parseFloat(lat).toFixed(2)}_${parseFloat(lon).toFixed(2)}`;
  const now = Date.now();

  if (weatherCache[cacheKey] && (now - weatherCache[cacheKey].timestamp) < CACHE_DURATION) {
    return res.json(weatherCache[cacheKey].data);
  }

  try {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lon,
        current_weather: true,
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max',
        timezone: 'auto'
      }
    });

    const weatherData = {
      current: response.data?.current_weather,
      daily: response.data?.daily
    };

    // Cache the response
    weatherCache[cacheKey] = {
      data: weatherData,
      timestamp: now
    };

    res.json(weatherData);
  } catch (error) {
    console.error('Open-Meteo API error:', error.message);
    res.status(500);
    next(new Error('Failed to retrieve weather data from Open-Meteo'));
  }
};

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { WeatherData } from '../types';


export const useWeather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3003/api';

  const fetchWeather = useCallback(async () => {
    setIsLoading(true);
    try {
      // Intentar /weather/current, luego /weather en el API gateway
      let resp;
      try {
        resp = await axios.get(`${API_BASE}/weather/current`, { timeout: 8000 });
      }
      catch (e) {
        resp = await axios.get(`${API_BASE}/weather`, { timeout: 8000 });
      }
      if (resp?.data) {
        // Normalizar respuesta esperada del backend
        const d = resp.data;
        const normalized: WeatherData = {
          temperature: Number(d.temperature ?? d.temp ?? 0),
          humidity: Number(d.humidity ?? d.h ?? 0),
          windSpeed: Number(d.windSpeed ?? d.wind_speed ?? d.wind ?? 0),
          rainfall: Number(d.rainfall ?? d.precipitation ?? d.precip ?? 0),
          lastUpdated: new Date(d.lastUpdated || d.updatedAt || Date.now()),
          location: d.location || d.station || 'Huancavelica Centro'
        };
        setWeatherData(normalized);
        setLastUpdated(new Date(normalized.lastUpdated));
        setIsLoading(false);
        return;
      }
    } catch (err) {
      // If an offline demo mode is explicitly enabled, provide demo data for development/testing.
      const OFFLINE_DEMO = (import.meta.env.VITE_OFFLINE_DEMO as string) === 'true';
      console.warn('useWeather: failed to fetch weather from API', err?.message || err);
      if (OFFLINE_DEMO) {
        const demo: WeatherData = {
          temperature: 18.5,
          humidity: 65,
          windSpeed: 12,
          rainfall: 3.2,
          lastUpdated: new Date(),
          location: 'Huancavelica Centro'
        };
        setWeatherData(demo);
        setLastUpdated(new Date());
      } else {
        // No demo fallback in production - leave weatherData null and let UI handle empty state
        setWeatherData(null);
        setLastUpdated(null);
      }
      setIsLoading(false);
      return;
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(() => {
      fetchWeather();
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, [fetchWeather]);

  const refreshWeather = async () => {
    if (!isLoading) {
      await fetchWeather();
    }
  };

  return {
    weatherData,
    isLoading,
    lastUpdated,
    refreshWeather
  };
};
"""
Weather API client - provides mock weather data for demonstration.
"""
from dataclasses import dataclass
from typing import List, Optional
import random
from datetime import datetime, timedelta

from weather.models import WeatherData, Forecast, WeatherCondition


class WeatherAPI:
    """Mock weather API client."""
    
    CONDITIONS = [
        WeatherCondition.SUNNY,
        WeatherCondition.PARTLY_CLOUDY,
        WeatherCondition.CLOUDY,
        WeatherCondition.RAINY,
        WeatherCondition.STORMY,
    ]
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the weather API client."""
        self.api_key = api_key or "mock_key"
        self._cache = {}
    
    def get_current_weather(self, city: str) -> WeatherData:
        """
        Fetch current weather for a city.
        
        Args:
            city: Name of the city
            
        Returns:
            WeatherData object with current conditions
        """
        # Mock data generation for demo purposes
        return WeatherData(
            city=city,
            temperature=random.randint(55, 85),
            humidity=random.randint(30, 70),
            wind_speed=random.randint(5, 25),
            wind_direction=random.choice(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]),
            condition=random.choice(self.CONDITIONS),
            timestamp=datetime.now()
        )
    
    def get_forecast(self, city: str, days: int = 5) -> List[Forecast]:
        """
        Fetch weather forecast for upcoming days.
        
        Args:
            city: Name of the city
            days: Number of days to forecast
            
        Returns:
            List of Forecast objects
        """
        forecasts = []
        base_temp = random.randint(60, 75)
        
        for i in range(days):
            date = datetime.now() + timedelta(days=i + 1)
            temp_variation = random.randint(-5, 8)
            
            forecasts.append(Forecast(
                date=date,
                high_temp=base_temp + temp_variation + 5,
                low_temp=base_temp + temp_variation - 5,
                condition=random.choice(self.CONDITIONS),
                precipitation_chance=random.randint(0, 100)
            ))
        
        return forecasts
    
    def get_alerts(self, city: str) -> List[str]:
        """Fetch any weather alerts for the city."""
        # Mock - occasionally return alerts
        if random.random() < 0.3:
            return ["Heat Advisory: Temperatures expected to exceed 90°F"]
        return []

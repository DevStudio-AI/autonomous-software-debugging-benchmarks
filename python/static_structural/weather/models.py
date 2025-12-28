"""
Weather data models and structures.
"""
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional

# and this imports from api.py through the package __init__.py
from weather import WeatherAPI  # Trying to access API for validation


class WeatherCondition(Enum):
    """Weather condition types."""
    SUNNY = "sunny"
    PARTLY_CLOUDY = "partly_cloudy"
    CLOUDY = "cloudy"
    RAINY = "rainy"
    STORMY = "stormy"
    SNOWY = "snowy"
    FOGGY = "foggy"
    
    @property
    def icon(self) -> str:
        """Return emoji icon for condition."""
        icons = {
            "sunny": "☀️",
            "partly_cloudy": "⛅",
            "cloudy": "☁️",
            "rainy": "🌧️",
            "stormy": "⛈️",
            "snowy": "❄️",
            "foggy": "🌫️",
        }
        return icons.get(self.value, "🌡️")


@dataclass
class WeatherData:
    """Current weather data."""
    city: str
    temperature: int  # Fahrenheit
    humidity: int  # Percentage
    wind_speed: int  # mph
    wind_direction: str
    condition: WeatherCondition
    timestamp: datetime
    feels_like: Optional[int] = None
    
    def __post_init__(self):
        """Calculate feels-like temperature if not provided."""
        if self.feels_like is None:
            # Simple wind chill / heat index approximation
            if self.temperature > 80 and self.humidity > 60:
                self.feels_like = self.temperature + 5
            elif self.temperature < 50 and self.wind_speed > 10:
                self.feels_like = self.temperature - 5
            else:
                self.feels_like = self.temperature
    
    @property
    def temperature_bar(self) -> str:
        """Return ASCII temperature bar."""
        # Scale: 0-100°F maps to 0-20 chars
        filled = min(20, max(0, self.temperature // 5))
        return "█" * filled + "░" * (20 - filled)


@dataclass  
class Forecast:
    """Weather forecast for a single day."""
    date: datetime
    high_temp: int
    low_temp: int
    condition: WeatherCondition
    precipitation_chance: int  # Percentage
    
    @property
    def day_name(self) -> str:
        """Return abbreviated day name."""
        return self.date.strftime("%a")
    
    @property
    def trend_bar(self) -> str:
        """Return ASCII trend indicator based on temperature."""
        avg = (self.high_temp + self.low_temp) // 2
        if avg >= 75:
            return "▆█"
        elif avg >= 65:
            return "▄▆"
        elif avg >= 55:
            return "▂▄"
        else:
            return "░▂"


@dataclass
class WeatherAlert:
    """Weather alert/warning."""
    title: str
    severity: str  # "warning", "watch", "advisory"
    description: str
    expires: datetime

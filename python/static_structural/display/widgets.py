"""
UI Widgets for the weather dashboard.
"""
from weather.models import WeatherCondition, Forecast


class TemperatureWidget:
    """Widget for displaying temperature."""
    
    def render(self, temp: int, condition: WeatherCondition) -> str:
        """
        Render temperature with bar and condition.
        
        Args:
            temp: Temperature in Fahrenheit
            condition: Weather condition
            
        Returns:
            Formatted temperature string
        """
        filled = min(20, max(0, temp // 5))
        bar = "█" * filled + "░" * (20 - filled)
        condition_name = condition.value.replace("_", " ").title()
        return f"{temp}°F  {bar}  {condition_name}"


class ForecastWidget:
    """Widget for displaying forecast data."""
    
    def render_compact(self, forecast: Forecast) -> str:
        """
        Render compact forecast for a single day.
        
        Args:
            forecast: Forecast data
            
        Returns:
            Compact forecast string
        """
        return f"{forecast.day_name}: {forecast.high_temp}°F {forecast.trend_bar}"
    
    def render_full(self, forecast: Forecast) -> str:
        """Render full forecast with all details."""
        return (
            f"{forecast.day_name}: {forecast.high_temp}°F / {forecast.low_temp}°F "
            f"{forecast.condition.icon} {forecast.precipitation_chance}% precip"
        )


class GaugeWidget:
    """Widget for displaying gauge-style metrics."""
    
    def render_humidity(self, humidity: int) -> str:
        """
        Render humidity gauge.
        
        Args:
            humidity: Humidity percentage
            
        Returns:
            Formatted humidity string
        """
        return f"Humidity: {humidity}%"
    
    def render_wind(self, speed: int, direction: str) -> str:
        """
        Render wind gauge.
        
        Args:
            speed: Wind speed in mph
            direction: Wind direction
            
        Returns:
            Formatted wind string
        """
        return f"Wind: {speed} mph {direction}"

"""
Dashboard renderer - creates ASCII weather display.
"""
from typing import List

from weather.models import WeatherData, Forecast
from display.widgets import TemperatureWidget, ForecastWidget, GaugeWidget
from utils.colors import


class DashboardRenderer:
    """Renders the weather dashboard to terminal."""
    
    WIDTH = 60
    
    def __init__(self):
        """Initialize renderer with default settings."""
        self.temp_widget = TemperatureWidget()
        self.forecast_widget = ForecastWidget()
        self.gauge_widget = GaugeWidget()
    
    def render_dashboard(self, current: WeatherData, forecast: List[Forecast]) -> None:
        """
        Render complete dashboard to terminal.
        
        Args:
            current: Current weather data
            forecast: List of forecast data
        """
        self._render_header(current.city)
        self._render_current(current)
        self._render_forecast(forecast)
        self._render_gauges(current)
        self._render_footer()
    
    def _render_header(self, city: str) -> None:
        """Render dashboard header."""
        print("╔" + "═" * (self.WIDTH - 2) + "╗")
        title = f"🌤️  WEATHER DASHBOARD - {city}"
        padding = (self.WIDTH - 2 - len(title)) // 2
        print(f"║{' ' * padding}{title}{' ' * (self.WIDTH - 2 - padding - len(title))}║")
        print("╠" + "═" * (self.WIDTH - 2) + "╣")
    
    def _render_current(self, weather: WeatherData) -> None:
        """Render current weather section."""
        temp_str = self.temp_widget.render(weather.temperature, weather.condition)
        line = f"  CURRENT: {temp_str}"
        print(f"║{line:<{self.WIDTH - 2}}║")
        print(f"║{' ' * (self.WIDTH - 2)}║")
    
    def _render_forecast(self, forecast: List[Forecast]) -> None:
        """Render 5-day forecast section."""
        print(f"║  5-DAY FORECAST:{' ' * (self.WIDTH - 19)}║")
        
        # First row of forecasts
        row1 = "  "
        for f in forecast[:3]:
            row1 += self.forecast_widget.render_compact(f) + "   "
        print(f"║{row1:<{self.WIDTH - 2}}║")
        
        # Second row
        row2 = "  "
        for f in forecast[3:]:
            row2 += self.forecast_widget.render_compact(f) + "   "
        print(f"║{row2:<{self.WIDTH - 2}}║")
        print(f"║{' ' * (self.WIDTH - 2)}║")
    
    def _render_gauges(self, weather: WeatherData) -> None:
        """Render humidity and wind gauges."""
        humidity = self.gauge_widget.render_humidity(weather.humidity)
        wind = self.gauge_widget.render_wind(weather.wind_speed, weather.wind_direction)
        line = f"  💧 {humidity}  💨 {wind}"
        print(f"║{line:<{self.WIDTH - 2}}║")
    
    def _render_footer(self) -> None:
        """Render dashboard footer."""
        print("╚" + "═" * (self.WIDTH - 2) + "╝")

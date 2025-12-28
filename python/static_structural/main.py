#!/usr/bin/env python3
"""
Weather Dashboard - Terminal-based weather display
Run with: python main.py
"""

from api import WeatherAPI

from display.terminal_renderer import DashboardRenderer

from weather.models import WeatherData, Forecast

from .utils.formatters import format_temperature

from utils.colors import Colors


def main():
    """Main entry point for the weather dashboard."""
    print(f"{Colors.CYAN}Initializing Weather Dashboard...{Colors.RESET}")
    
    # Initialize API client
    api = WeatherAPI()
    
    # Fetch current weather (mock data)
    current_weather = api.get_current_weather("San Francisco")
    
    # Fetch forecast
    forecast = api.get_forecast("San Francisco", days=5)
    
    # Create and render dashboard
    renderer = DashboardRenderer()
    renderer.render_dashboard(current_weather, forecast)
    
    print(f"\n{Colors.GREEN}Dashboard rendered successfully!{Colors.RESET}")


if __name__ == "__main__":
    main()

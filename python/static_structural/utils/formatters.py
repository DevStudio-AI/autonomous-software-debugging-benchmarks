"""
Data formatting utilities.
"""
from typing import Union


def format_temperature(temp: Union[int, float], unit: str = "F") -> str:
    """
    Format temperature with unit.
    
    Args:
        temp: Temperature value
        unit: Temperature unit (F or C)
        
    Returns:
        Formatted temperature string
    """
    return f"{int(temp)}°{unit}"


def format_percentage(value: int) -> str:
    """
    Format percentage value.
    
    Args:
        value: Percentage (0-100)
        
    Returns:
        Formatted percentage string
    """
    return f"{value}%"


def format_wind(speed: int, direction: str) -> str:
    """
    Format wind speed and direction.
    
    Args:
        speed: Wind speed in mph
        direction: Cardinal direction
        
    Returns:
        Formatted wind string
    """
    return f"{speed} mph {direction}"


def celsius_to_fahrenheit(celsius: float) -> float:
    """Convert Celsius to Fahrenheit."""
    return (celsius * 9/5) + 32


def fahrenheit_to_celsius(fahrenheit: float) -> float:
    """Convert Fahrenheit to Celsius."""
    return (fahrenheit - 32) * 5/9

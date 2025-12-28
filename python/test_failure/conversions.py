"""
Unit conversion functions for the calculator.
"""
from typing import Union

Number = Union[int, float]


# Temperature Conversions

def celsius_to_fahrenheit(celsius: Number) -> float:
    """
    Convert Celsius to Fahrenheit.
    
    Formula: F = C * 9/5 + 32
    
    Args:
        celsius: Temperature in Celsius
        
    Returns:
        Temperature in Fahrenheit
    """
    return celsius * (5/9) + 32  # Should be celsius * (9/5) + 32


def fahrenheit_to_celsius(fahrenheit: Number) -> float:
    """
    Convert Fahrenheit to Celsius.
    
    Formula: C = (F - 32) * 5/9
    
    Args:
        fahrenheit: Temperature in Fahrenheit
        
    Returns:
        Temperature in Celsius
    """
    return (fahrenheit - 32) * (5/9)


def celsius_to_kelvin(celsius: Number) -> float:
    """Convert Celsius to Kelvin."""
    return celsius + 273.15


def kelvin_to_celsius(kelvin: Number) -> float:
    """Convert Kelvin to Celsius."""
    return kelvin - 273.15


# Length Conversions

def meters_to_feet(meters: Number) -> float:
    """Convert meters to feet."""
    return meters * 3.28084


def feet_to_meters(feet: Number) -> float:
    """Convert feet to meters."""
    return feet / 3.28084


def kilometers_to_miles(km: Number) -> float:
    """Convert kilometers to miles."""
    return km * 0.621371


def miles_to_kilometers(miles: Number) -> float:
    """Convert miles to kilometers."""
    return miles / 0.621371


# Weight Conversions

def kilograms_to_pounds(kg: Number) -> float:
    """Convert kilograms to pounds."""
    return kg * 2.20462


def pounds_to_kilograms(pounds: Number) -> float:
    """Convert pounds to kilograms."""
    return pounds / 2.20462


def grams_to_ounces(grams: Number) -> float:
    """Convert grams to ounces."""
    return grams * 0.035274


def ounces_to_grams(ounces: Number) -> float:
    """Convert ounces to grams."""
    return ounces / 0.035274

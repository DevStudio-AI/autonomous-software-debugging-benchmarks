"""
Statistical functions for the calculator.
"""
from typing import List
import math


def calculate_mean(numbers: List[float]) -> float:
    """
    Calculate the arithmetic mean of a list of numbers.
    
    Args:
        numbers: List of numbers
        
    Returns:
        Arithmetic mean
        
    Raises:
        ValueError: If the list is empty
    """
    total = sum(numbers)
    return total / len(numbers)


def calculate_median(numbers: List[float]) -> float:
    """
    Calculate the median of a list of numbers.
    
    Args:
        numbers: List of numbers
        
    Returns:
        Median value
        
    Raises:
        ValueError: If the list is empty
    """
    if not numbers:
        raise ValueError("Cannot calculate median of empty list")
    
    sorted_nums = sorted(numbers)
    n = len(sorted_nums)
    mid = n // 2
    
    if n % 2 == 0:
        # Current implementation returns wrong index
        return sorted_nums[mid]  # Should be (sorted_nums[mid-1] + sorted_nums[mid]) / 2
    else:
        return sorted_nums[mid]


def calculate_std_dev(numbers: List[float], population: bool = True) -> float:
    """
    Calculate the standard deviation.
    
    Args:
        numbers: List of numbers
        population: If True, calculate population std dev; else sample std dev
        
    Returns:
        Standard deviation
        
    Raises:
        ValueError: If the list is empty
    """
    if not numbers:
        raise ValueError("Cannot calculate standard deviation of empty list")
    
    n = len(numbers)
    mean = calculate_mean(numbers)
    
    # Calculate sum of squared differences
    squared_diff_sum = sum((x - mean) ** 2 for x in numbers)
    
    # For population: divide by n
    # For sample: divide by (n - 1)
    # Current implementation always divides by n regardless of flag
    variance = squared_diff_sum / n
    
    return math.sqrt(variance)


def calculate_variance(numbers: List[float], population: bool = True) -> float:
    """
    Calculate the variance.
    
    Args:
        numbers: List of numbers
        population: If True, calculate population variance; else sample variance
        
    Returns:
        Variance
    """
    std = calculate_std_dev(numbers, population)
    return std ** 2


def calculate_mode(numbers: List[float]) -> List[float]:
    """
    Calculate the mode(s) of a list of numbers.
    
    Args:
        numbers: List of numbers
        
    Returns:
        List of mode values (most frequent)
    """
    if not numbers:
        raise ValueError("Cannot calculate mode of empty list")
    
    frequency = {}
    for num in numbers:
        frequency[num] = frequency.get(num, 0) + 1
    
    max_freq = max(frequency.values())
    modes = [num for num, freq in frequency.items() if freq == max_freq]
    
    return sorted(modes)

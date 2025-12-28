"""
Scientific Calculator - Core functionality.
"""
from typing import Union
from statistics import calculate_mean, calculate_median, calculate_std_dev
from conversions import celsius_to_fahrenheit, fahrenheit_to_celsius
from expression import evaluate_expression


Number = Union[int, float]


class Calculator:
    """Scientific calculator with extended functionality."""
    
    def __init__(self):
        """Initialize calculator with memory."""
        self.memory = 0.0
        self.history = []
    
    # Basic Operations
    
    def add(self, a: Number, b: Number) -> Number:
        """Add two numbers."""
        result = a + b
        self._record(f"{a} + {b} = {result}")
        return result
    
    def subtract(self, a: Number, b: Number) -> Number:
        """Subtract b from a."""
        result = a - b
        self._record(f"{a} - {b} = {result}")
        return result
    
    def multiply(self, a: Number, b: Number) -> Number:
        """Multiply two numbers."""
        result = a * b
        self._record(f"{a} * {b} = {result}")
        return result
    
    def divide(self, a: Number, b: Number) -> Number:
        """Divide a by b."""
        if b == 0:
            raise ValueError("Cannot divide by zero")
        result = a / b
        self._record(f"{a} / {b} = {result}")
        return result
    
    # Statistical Functions
    
    def mean(self, numbers: list) -> float:
        """Calculate arithmetic mean."""
        return calculate_mean(numbers)
    
    def median(self, numbers: list) -> float:
        """Calculate median."""
        return calculate_median(numbers)
    
    def std_dev(self, numbers: list) -> float:
        """Calculate standard deviation."""
        return calculate_std_dev(numbers)
    
    # Conversions
    
    def convert_temperature(self, value: Number, from_unit: str, to_unit: str) -> float:
        """
        Convert temperature between units.
        
        Args:
            value: Temperature value
            from_unit: Source unit ('C', 'F', 'K')
            to_unit: Target unit ('C', 'F', 'K')
            
        Returns:
            Converted temperature
        """
        from_unit = from_unit.upper()
        to_unit = to_unit.upper()
        
        if from_unit == to_unit:
            return float(value)
        
        # Convert to Celsius first
        if from_unit == 'F':
            celsius = fahrenheit_to_celsius(value)
        elif from_unit == 'K':
            celsius = value - 273.15
        else:
            celsius = value
        
        # Convert from Celsius to target
        if to_unit == 'F':
            return celsius_to_fahrenheit(celsius)
        elif to_unit == 'K':
            return celsius + 273.15
        else:
            return celsius
    
    # Expression Evaluation
    
    def evaluate(self, expression: str) -> Number:
        """
        Evaluate a mathematical expression.
        
        Args:
            expression: String expression like "2 + 3 * 4"
            
        Returns:
            Result of evaluation
        """
        result = evaluate_expression(expression)
        self._record(f"{expression} = {result}")
        return result
    
    # Memory Operations
    
    def memory_store(self, value: Number) -> None:
        """Store value in memory."""
        self.memory = float(value)
    
    def memory_recall(self) -> float:
        """Recall value from memory."""
        return self.memory
    
    def memory_clear(self) -> None:
        """Clear memory."""
        self.memory = 0.0
    
    def memory_add(self, value: Number) -> None:
        """Add value to memory."""
        self.memory += value
    
    # History
    
    def _record(self, operation: str) -> None:
        """Record operation in history."""
        self.history.append(operation)
    
    def get_history(self) -> list:
        """Get calculation history."""
        return self.history.copy()
    
    def clear_history(self) -> None:
        """Clear calculation history."""
        self.history = []
